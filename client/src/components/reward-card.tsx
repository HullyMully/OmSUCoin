import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tag } from "lucide-react";
import { Reward } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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

interface RewardCardProps {
  reward: Reward;
  onPurchase?: () => void;
}

const RewardCard: React.FC<RewardCardProps> = ({ reward, onPurchase }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const isAvailable = reward.status === "available";
  const hasQuantity = reward.quantity === null || reward.quantity > 0;
  const canPurchase = user && user.tokenBalance >= reward.tokenCost && isAvailable && hasQuantity;
  
  const handlePurchase = async () => {
    if (!user || !canPurchase) return;
    
    try {
      const response = await apiRequest("POST", `/api/rewards/${reward.id}/purchase`);
      const result = await response.json();
      
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my/transactions"] });
      
      toast({
        title: "Успешно!",
        description: `Вы приобрели ${reward.title}. Новый баланс: ${result.newBalance} OMSU`,
      });
      
      if (onPurchase) onPurchase();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось приобрести награду",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Card className="overflow-hidden border border-neutral-200 hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium text-neutral-800">{reward.title}</h3>
          <div className="flex items-center space-x-1 bg-amber-100 px-2 py-1 rounded-full">
            <Tag className="h-4 w-4 text-amber-500" />
            <span className="text-amber-700 font-medium text-sm">{reward.tokenCost}</span>
          </div>
        </div>
        
        <p className="mt-2 text-sm text-neutral-600">{reward.description}</p>
        
        <div className="mt-5 flex justify-between items-center">
          <span className="text-xs text-neutral-500">
            {reward.quantity !== null 
              ? `Доступно: ${reward.quantity} шт.` 
              : "Доступно: без ограничений"}
          </span>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant={canPurchase ? "default" : "outline"} 
                disabled={!canPurchase}
              >
                Обменять
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Подтверждение обмена</AlertDialogTitle>
                <AlertDialogDescription>
                  Вы действительно хотите обменять {reward.tokenCost} OMSU на "{reward.title}"?
                  <div className="mt-2 p-3 bg-neutral-50 rounded-md">
                    <p className="font-medium">Ваш баланс: {user?.tokenBalance} OMSU</p>
                    <p className="text-neutral-500">После обмена: {user ? user.tokenBalance - reward.tokenCost : 0} OMSU</p>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction onClick={handlePurchase}>Подтвердить</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default RewardCard;
