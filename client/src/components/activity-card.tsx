import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, MapPin, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Activity, Registration } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface ActivityCardProps {
  activity: Activity;
  userRegistration?: Registration;
  onRegister?: () => void;
  onCancelRegistration?: () => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  userRegistration,
  onRegister,
  onCancelRegistration,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === "admin";
  
  const isRegistered = !!userRegistration;
  const isPast = new Date(activity.date) < new Date();
  const isOpen = activity.status === "open";
  
  const handleRegister = async () => {
    if (!user) return;
    
    try {
      await apiRequest("POST", `/api/activities/${activity.id}/register`);
      queryClient.invalidateQueries({ queryKey: ["/api/my/registrations"] });
      
      toast({
        title: "Успешно!",
        description: "Вы записались на активность",
      });
      
      if (onRegister) onRegister();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось записаться на активность",
        variant: "destructive",
      });
    }
  };
  
  const handleCancelRegistration = async () => {
    if (!userRegistration) return;
    
    try {
      // Call the API endpoint for cancellation
      await apiRequest("DELETE", `/api/activities/${activity.id}/register`);
      queryClient.invalidateQueries({ queryKey: ["/api/my/registrations"] });
      
      toast({
        title: "Запись отменена",
        description: "Вы отменили запись на активность",
      });
      
      if (onCancelRegistration) onCancelRegistration();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось отменить запись",
        variant: "destructive",
      });
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "d MMMM yyyy, HH:mm", { locale: ru });
  };
  
  const getStatusBadge = () => {
    if (isRegistered) {
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          Вы записаны
        </Badge>
      );
    }
    
    if (isPast) {
      return (
        <Badge variant="outline" className="bg-neutral-100 text-neutral-800 hover:bg-neutral-100">
          Завершена
        </Badge>
      );
    }
    
    if (isOpen) {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          Открыта запись
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="bg-neutral-100 text-neutral-800 hover:bg-neutral-100">
        Запись закрыта
      </Badge>
    );
  };
  
  return (
    <Card className="overflow-hidden border border-neutral-200 hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-neutral-800">{activity.title}</h3>
            <p className="mt-1 text-sm text-neutral-500">{activity.description}</p>
          </div>
          <div className="flex items-center space-x-1 bg-amber-100 px-2 py-1 rounded-full">
            <Tag className="h-4 w-4 text-amber-500" />
            <span className="text-amber-700 font-medium text-sm">{activity.tokens}</span>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm">
            <CalendarIcon className="h-4 w-4 text-neutral-400 mr-2" />
            <span className="text-neutral-600">{formatDate(activity.date)}</span>
          </div>
          <div className="flex items-center text-sm">
            <MapPin className="h-4 w-4 text-neutral-400 mr-2" />
            <span className="text-neutral-600">{activity.location}</span>
          </div>
        </div>
        
        <div className="mt-4">
          {getStatusBadge()}
        </div>
        
        <div className="mt-5">
          {isAdmin ? (
            <Button 
              variant="default" 
              className="w-full"
              asChild
            >
              <a href={`/admin/activity/${activity.id}`}>Управление</a>
            </Button>
          ) : isRegistered ? (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleCancelRegistration}
              disabled={isPast}
            >
              Отменить запись
            </Button>
          ) : (
            <Button 
              variant="default" 
              className="w-full"
              onClick={handleRegister}
              disabled={!isOpen || isPast}
            >
              Записаться
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityCard;
