import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Users, 
  Calendar, 
  Tag, 
  Info, 
  Check, 
  X, 
  Edit, 
  Filter,
  AlertTriangle,
  User,
  Mail,
  School,
  Key,
  Wallet
} from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Participant {
  registrationId: number;
  registrationStatus: string;
  userId: number;
  name: string;
  surname: string;
  studentId: string;
  pseudonym: string;
  email: string;
  faculty: string;
  walletAddress: string | null;
}

const ActivityParticipants: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [, params] = useRoute("/admin/activity/:id");
  const activityId = params?.id ? parseInt(params.id) : null;
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
  const [mintAmount, setMintAmount] = useState<number | null>(null);
  const [mintNote, setMintNote] = useState("");
  const [mintRecipients, setMintRecipients] = useState<string>("selected");
  
  // Redirect non-admin users or if activityId is missing
  if (!isAdmin || !activityId) {
    return <Redirect to="/" />;
  }
  
  // Fetch activity details
  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: [`/api/activities/${activityId}`],
    queryFn: async () => {
      const response = await fetch(`/api/activities/${activityId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch activity");
      }
      return response.json();
    },
  });
  
  // Fetch participants
  const { data: participants, isLoading: participantsLoading } = useQuery<Participant[]>({
    queryKey: [`/api/activities/${activityId}/registrations`],
    queryFn: async () => {
      const response = await fetch(`/api/activities/${activityId}/registrations`);
      if (!response.ok) {
        throw new Error("Failed to fetch participants");
      }
      return response.json();
    },
  });
  
  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return format(new Date(dateString), "d MMMM yyyy, HH:mm", { locale: ru });
  };
  
  // Update registration status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ registrationId, status }: { registrationId: number; status: string }) => {
      await apiRequest("PATCH", `/api/registrations/${registrationId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/activities/${activityId}/registrations`] });
      toast({
        title: "Статус обновлен",
        description: "Статус участника успешно изменен",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус участника",
        variant: "destructive",
      });
      console.error(error);
    },
  });
  
  // Mint tokens mutation
  const mintTokensMutation = useMutation({
    mutationFn: async ({ userIds, note }: { userIds: number[]; note: string }) => {
      await apiRequest("POST", `/api/activities/${activityId}/mint`, { userIds, note });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/activities/${activityId}/registrations`] });
      toast({
        title: "Токены начислены",
        description: "Токены успешно начислены участникам",
      });
      setSelectedParticipants([]);
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось начислить токены",
        variant: "destructive",
      });
      console.error(error);
    },
  });
  
  // Filter participants by search query and status
  const filteredParticipants = participants?.filter(
    (participant) => {
      const matchesSearch = 
        participant.pseudonym.toLowerCase().includes(searchQuery.toLowerCase()) ||
        participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        participant.surname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        participant.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        participant.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = 
        statusFilter === "all" || 
        participant.registrationStatus === statusFilter;
      
      return matchesSearch && matchesStatus;
    }
  );
  
  // Handle confirm/reject actions
  const handleUpdateStatus = (registrationId: number, status: string) => {
    updateStatusMutation.mutate({ registrationId, status });
  };
  
  // Handle mint tokens
  const handleMintTokens = () => {
    if (!activity) return;
    
    let userIds: number[] = [];
    
    if (mintRecipients === "selected") {
      userIds = selectedParticipants;
    } else if (mintRecipients === "confirmed") {
      userIds = participants
        ?.filter(p => p.registrationStatus === "confirmed")
        .map(p => p.userId) || [];
    } else { // all
      userIds = participants?.map(p => p.userId) || [];
    }
    
    if (userIds.length === 0) {
      toast({
        title: "Ошибка",
        description: "Не выбраны участники для начисления токенов",
        variant: "destructive",
      });
      return;
    }
    
    mintTokensMutation.mutate({ 
      userIds, 
      note: mintNote || `Токены за участие в "${activity.title}"`
    });
  };
  
  // Table columns
  const columns: ColumnDef<Participant>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getRowModel().rows.length > 0 &&
            table.getIsAllPageRowsSelected()
          }
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value);
            
            if (value) {
              setSelectedParticipants(
                table.getRowModel().rows.map((row) => row.original.userId)
              );
            } else {
              setSelectedParticipants([]);
            }
          }}
          aria-label="Выбрать всех"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value);
            
            if (value) {
              setSelectedParticipants([...selectedParticipants, row.original.userId]);
            } else {
              setSelectedParticipants(
                selectedParticipants.filter((id) => id !== row.original.userId)
              );
            }
          }}
          aria-label="Выбрать участника"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "student",
      header: "Студент",
      cell: ({ row }) => {
        const participant = row.original;
        const initials = `${participant.name[0]}${participant.surname[0]}`.toUpperCase();
        
        return (
          <div className="flex items-center">
            <Avatar className="h-10 w-10 bg-primary-200">
              <AvatarFallback className="text-primary-600">{initials}</AvatarFallback>
            </Avatar>
            <div className="ml-4">
              <div className="text-sm font-medium text-neutral-900">
                {participant.name} {participant.surname}
              </div>
              <div className="text-xs text-neutral-500">
                {participant.pseudonym ? `Псевдоним: ${participant.pseudonym}` : 'Нет псевдонима'}
              </div>
              <div className="text-xs text-neutral-500">{participant.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "studentId",
      header: "ID студента",
      cell: ({ row }) => {
        return <div className="text-sm text-neutral-900">{row.original.studentId}</div>;
      },
    },
    {
      accessorKey: "faculty",
      header: "Факультет",
      cell: ({ row }) => {
        return <div className="text-sm text-neutral-900">{row.original.faculty || "Не указан"}</div>;
      },
    },
    {
      accessorKey: "status",
      header: "Статус",
      cell: ({ row }) => {
        const status = row.original.registrationStatus;
        
        if (status === "confirmed") {
          return (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
              Подтверждён
            </Badge>
          );
        } else if (status === "rejected") {
          return (
            <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
              Отклонен
            </Badge>
          );
        } else {
          return (
            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
              Не подтверждён
            </Badge>
          );
        }
      },
    },
    {
      id: "actions",
      header: "Действия",
      cell: ({ row }) => {
        const participant = row.original;
        const status = participant.registrationStatus;
        
        return (
          <div className="flex space-x-2">
            {status === "registered" && (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleUpdateStatus(participant.registrationId, "confirmed")}
                  title="Подтвердить"
                >
                  <Check className="h-4 w-4 text-green-600" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleUpdateStatus(participant.registrationId, "rejected")}
                  title="Отклонить"
                >
                  <X className="h-4 w-4 text-red-600" />
                </Button>
              </>
            )}
            
            {status === "confirmed" && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleUpdateStatus(participant.registrationId, "registered")}
                title="Отменить подтверждение"
              >
                <X className="h-4 w-4 text-neutral-600" />
              </Button>
            )}
            
            {status === "rejected" && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleUpdateStatus(participant.registrationId, "registered")}
                title="Отменить отклонение"
              >
                <Check className="h-4 w-4 text-neutral-600" />
              </Button>
            )}
            
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  title="Просмотр информации"
                >
                  <Info className="h-4 w-4 text-neutral-600" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Информация о студенте</DialogTitle>
                  <DialogDescription>
                    Детальная информация о студенте
                  </DialogDescription>
                </DialogHeader>
                
                <div className="py-4">
                  <Card>
                    <CardHeader className="p-4 pb-2 flex flex-row items-center space-y-0">
                      <Avatar className="h-12 w-12 mr-3 bg-primary-200">
                        <AvatarFallback className="text-primary-600">
                          {`${participant.name[0]}${participant.surname[0]}`.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{participant.name} {participant.surname}</CardTitle>
                        <CardDescription>{participant.email}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-neutral-400" />
                        <div className="grid grid-cols-3 w-full">
                          <span className="text-sm text-neutral-500">Псевдоним:</span>
                          <span className="text-sm font-medium col-span-2">{participant.pseudonym || "Не указан"}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Key className="h-4 w-4 text-neutral-400" />
                        <div className="grid grid-cols-3 w-full">
                          <span className="text-sm text-neutral-500">Студенческий ID:</span>
                          <span className="text-sm font-medium col-span-2">{participant.studentId}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <School className="h-4 w-4 text-neutral-400" />
                        <div className="grid grid-cols-3 w-full">
                          <span className="text-sm text-neutral-500">Факультет:</span>
                          <span className="text-sm font-medium col-span-2">{participant.faculty || "Не указан"}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-neutral-400" />
                        <div className="grid grid-cols-3 w-full">
                          <span className="text-sm text-neutral-500">Email:</span>
                          <span className="text-sm font-medium col-span-2">{participant.email}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Wallet className="h-4 w-4 text-neutral-400" />
                        <div className="grid grid-cols-3 w-full">
                          <span className="text-sm text-neutral-500">Кошелек:</span>
                          <span className="text-sm font-medium col-span-2 truncate">
                            {participant.walletAddress || "Не добавлен"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {!participant.walletAddress && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-start">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-yellow-700">
                        У студента не добавлен кошелек. Для начисления токенов необходимо, чтобы студент добавил адрес кошелька в своем профиле.
                      </p>
                    </div>
                  )}
                </div>
                
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Закрыть</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        );
      },
    },
  ];
  
  if (activityLoading || participantsLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-neutral-500">Загрузка данных...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-display font-bold text-neutral-800 sm:text-3xl">
            Участники активности
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {activity?.title}
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Редактировать
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button disabled={mintTokensMutation.isPending}>
                <Tag className="mr-2 h-4 w-4" />
                Начислить токены
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Начисление токенов</AlertDialogTitle>
                <AlertDialogDescription>
                  Начислить токены участникам активности через смарт-контракт.
                  {!selectedParticipants.length && mintRecipients === "selected" && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md flex items-start">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5" />
                      <p className="text-sm text-yellow-700">Не выбрано ни одного участника</p>
                    </div>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Получатели
                  </label>
                  <Select
                    value={mintRecipients}
                    onValueChange={setMintRecipients}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите получателей" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="selected">Выбранные студенты ({selectedParticipants.length})</SelectItem>
                      <SelectItem value="confirmed">Все подтвержденные ({participants?.filter(p => p.registrationStatus === "confirmed").length || 0})</SelectItem>
                      <SelectItem value="all">Все участники ({participants?.length || 0})</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Количество токенов
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Tag className="h-4 w-4 text-amber-500" />
                    </div>
                    <Input
                      type="number"
                      value={mintAmount ?? activity?.tokens ?? 0}
                      onChange={(e) => setMintAmount(parseInt(e.target.value) || 0)}
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    По умолчанию: {activity?.tokens}
                  </p>
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Примечание
                  </label>
                  <Textarea
                    rows={2}
                    placeholder={`Токены за участие в "${activity?.title}"`}
                    value={mintNote}
                    onChange={(e) => setMintNote(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="mt-2 bg-neutral-50 rounded-lg p-4 text-sm">
                <div className="flex items-start">
                  <Info className="h-4 w-4 text-neutral-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-neutral-700">Информация о транзакции</h3>
                    <p className="text-neutral-500 mt-1">
                      Токены будут отправлены с использованием смарт-контракта OmSUCoin через функцию batchMint. 
                      Процесс может занять некоторое время.
                    </p>
                  </div>
                </div>
              </div>
              
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleMintTokens}
                  disabled={
                    mintTokensMutation.isPending || 
                    (mintRecipients === "selected" && selectedParticipants.length === 0)
                  }
                >
                  {mintTokensMutation.isPending ? "Начисление..." : "Начислить токены"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      {/* Activity Info Card */}
      <Card className="mb-6">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-neutral-200">
            <div className="p-4 flex items-center">
              <Users className="h-5 w-5 text-neutral-400 mr-3" />
              <div>
                <p className="text-sm text-neutral-500">Зарегистрировано</p>
                <p className="text-xl font-semibold text-neutral-800">
                  {participants?.length || 0}
                  {activity?.maxParticipants && ` / ${activity.maxParticipants}`}
                </p>
              </div>
            </div>
            <div className="p-4 flex items-center">
              <Calendar className="h-5 w-5 text-neutral-400 mr-3" />
              <div>
                <p className="text-sm text-neutral-500">Дата проведения</p>
                <p className="text-xl font-semibold text-neutral-800">
                  {formatDate(activity?.date)}
                </p>
              </div>
            </div>
            <div className="p-4 flex items-center">
              <Tag className="h-5 w-5 text-neutral-400 mr-3" />
              <div>
                <p className="text-sm text-neutral-500">Токены за участие</p>
                <p className="text-xl font-semibold text-neutral-800">
                  {activity?.tokens}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Participants Table */}
      <Card>
        {/* Table Filters */}
        <div className="p-4 border-b border-neutral-200 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 sm:items-center">
          <div className="relative rounded-md shadow-sm flex-1 max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-neutral-400" />
            </div>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              placeholder="Поиск по ID или псевдониму..."
            />
          </div>
          
          <div className="flex space-x-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Все участники" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все участники</SelectItem>
                <SelectItem value="confirmed">Подтвержденные</SelectItem>
                <SelectItem value="registered">Неподтвержденные</SelectItem>
                <SelectItem value="rejected">Отклоненные</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {filteredParticipants && filteredParticipants.length > 0 ? (
          <DataTable
            data={filteredParticipants}
            columns={columns}
          />
        ) : (
          <div className="p-8 text-center">
            <p className="text-neutral-500">
              {participants && participants.length > 0
                ? "Нет участников, соответствующих критериям поиска"
                : "Нет зарегистрированных участников"}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ActivityParticipants;
