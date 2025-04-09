import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Transaction } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  MapPin, 
  User, 
  Mail, 
  Award, 
  ShieldCheck, 
  Wallet,
  Pencil, 
  Save 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import TransactionHistory from "@/components/transaction-history";
import { initWeb3, getCurrentAccount } from "@/lib/web3";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editingPseudonym, setEditingPseudonym] = useState(false);
  const [pseudonym, setPseudonym] = useState(user?.pseudonym || "");
  const [connectingWallet, setConnectingWallet] = useState(false);

  useEffect(() => {
    if (user) {
      setPseudonym(user.pseudonym || "");
    }
  }, [user]);

  // Fetch user transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/my/transactions"],
    queryFn: async () => {
      const response = await fetch("/api/my/transactions");
      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }
      return response.json();
    },
  });

  // Fetch leaderboard to get position
  const { data: leaderboard } = useQuery({
    queryKey: ["/api/leaderboard"],
    queryFn: async () => {
      const response = await fetch("/api/leaderboard?limit=100");
      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard");
      }
      return response.json();
    },
  });

  // User position in leaderboard
  const userPosition = leaderboard?.findIndex((u: any) => u.id === user?.id) ?? -1;

  // Update pseudonym mutation
  const updatePseudonymMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", `/api/users/${user?.id}`, { pseudonym });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setEditingPseudonym(false);
      toast({
        title: "Успешно",
        description: "Псевдоним обновлен",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить псевдоним",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  // Connect wallet mutation
  const connectWalletMutation = useMutation({
    mutationFn: async (walletAddress: string) => {
      await apiRequest("PATCH", `/api/users/${user?.id}`, { walletAddress });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Успешно",
        description: "Кошелек MetaMask подключен",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось подключить кошелек",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const handleSavePseudonym = () => {
    if (pseudonym.trim().length < 2) {
      toast({
        title: "Ошибка",
        description: "Псевдоним должен содержать минимум 2 символа",
        variant: "destructive",
      });
      return;
    }
    updatePseudonymMutation.mutate();
  };

  const handleConnectWallet = async () => {
    if (!user) return;
    
    try {
      setConnectingWallet(true);
      await initWeb3();
      const account = await getCurrentAccount();
      
      if (!account) {
        throw new Error("Не удалось получить адрес кошелька");
      }
      
      connectWalletMutation.mutate(account);
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось подключить кошелек",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setConnectingWallet(false);
    }
  };

  const getInitials = () => {
    if (!user?.name || !user?.surname) return "СТ";
    return `${user.name[0]}${user.surname[0]}`.toUpperCase();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Н/Д";
    return format(new Date(dateString), "d MMMM yyyy", { locale: ru });
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Загрузка профиля...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-display font-bold text-neutral-800 sm:text-3xl">Профиль студента</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1">
          <Card className="overflow-hidden border border-neutral-200">
            <CardContent className="p-6">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-primary-200 flex items-center justify-center mb-4">
                  <span className="text-primary-600 text-2xl font-semibold">{getInitials()}</span>
                </div>
                
                {editingPseudonym ? (
                  <div className="w-full flex space-x-2 mb-2">
                    <Input
                      value={pseudonym}
                      onChange={(e) => setPseudonym(e.target.value)}
                      className="text-center"
                      placeholder="Ваш псевдоним"
                    />
                    <Button 
                      size="icon" 
                      variant="outline" 
                      onClick={handleSavePseudonym}
                      disabled={updatePseudonymMutation.isPending}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center mb-2">
                    <h2 className="text-xl font-semibold text-neutral-800 mr-2">
                      {user.pseudonym || `Student${user.id}`}
                    </h2>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => setEditingPseudonym(true)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                
                <p className="text-sm text-neutral-500">{user.faculty || "Факультет не указан"}</p>

                <div className="mt-4 flex items-center space-x-2 bg-amber-100 px-3 py-2 rounded-lg">
                  <Award className="h-5 w-5 text-amber-500" />
                  <span className="text-xl font-bold text-amber-700">{user.tokenBalance}</span>
                </div>

                <div className="mt-6 flex flex-col space-y-3 w-full">
                  <Button
                    variant="outline"
                    disabled={updatePseudonymMutation.isPending}
                    onClick={() => setEditingPseudonym(true)}
                    className="justify-center"
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Изменить псевдоним
                  </Button>
                  
                  <Button
                    variant="default"
                    disabled={connectingWallet || connectWalletMutation.isPending || !!user.walletAddress}
                    onClick={handleConnectWallet}
                    className="justify-center"
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    {user.walletAddress 
                      ? "Кошелек подключен" 
                      : connectingWallet 
                        ? "Подключение..." 
                        : "Подключить MetaMask"}
                  </Button>
                </div>
              </div>

              <div className="mt-6 border-t border-neutral-200 pt-6">
                <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-3">Информация</h3>
                <dl className="space-y-3">
                  <div className="flex items-center">
                    <dt className="text-sm font-medium text-neutral-500 flex items-center w-1/2">
                      <User className="h-4 w-4 mr-2" /> Имя
                    </dt>
                    <dd className="text-sm text-neutral-900">
                      {user.name} {user.surname}
                    </dd>
                  </div>
                  
                  <div className="flex items-center">
                    <dt className="text-sm font-medium text-neutral-500 flex items-center w-1/2">
                      <ShieldCheck className="h-4 w-4 mr-2" /> ID студента
                    </dt>
                    <dd className="text-sm text-neutral-900">{user.studentId}</dd>
                  </div>
                  
                  <div className="flex items-center">
                    <dt className="text-sm font-medium text-neutral-500 flex items-center w-1/2">
                      <Mail className="h-4 w-4 mr-2" /> Email
                    </dt>
                    <dd className="text-sm text-neutral-900">{user.email}</dd>
                  </div>
                  
                  <div className="flex items-center">
                    <dt className="text-sm font-medium text-neutral-500 flex items-center w-1/2">
                      <Calendar className="h-4 w-4 mr-2" /> Дата регистрации
                    </dt>
                    <dd className="text-sm text-neutral-900">{formatDate(user.createdAt)}</dd>
                  </div>
                  
                  <div className="flex items-center">
                    <dt className="text-sm font-medium text-neutral-500 flex items-center w-1/2">
                      <Award className="h-4 w-4 mr-2" /> Место в рейтинге
                    </dt>
                    <dd className="text-sm text-neutral-900">
                      {userPosition !== -1 ? `#${userPosition + 1}` : "Не в рейтинге"}
                    </dd>
                  </div>
                  
                  <div className="flex items-center">
                    <dt className="text-sm font-medium text-neutral-500 flex items-center w-1/2">
                      <Wallet className="h-4 w-4 mr-2" /> Кошелек
                    </dt>
                    <dd className="text-sm text-neutral-900 truncate max-w-[150px]" title={user.walletAddress || ""}>
                      {user.walletAddress 
                        ? `${user.walletAddress.substring(0, 6)}...${user.walletAddress.substring(user.walletAddress.length - 4)}` 
                        : "Не подключен"}
                    </dd>
                  </div>
                </dl>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <div className="md:col-span-2">
          {transactionsLoading ? (
            <Card>
              <CardContent className="p-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </CardContent>
            </Card>
          ) : transactions && transactions.length > 0 ? (
            <TransactionHistory transactions={transactions} showMoreLink={false} />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-neutral-500 mb-4">У вас пока нет транзакций</p>
                <Button asChild>
                  <a href="/activities">Найти активности</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
