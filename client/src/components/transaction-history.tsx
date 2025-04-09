import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@shared/schema";
import { Circle, ShoppingCart, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface TransactionHistoryProps {
  transactions: Transaction[];
  showMoreLink?: boolean;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ 
  transactions,
  showMoreLink = true 
}) => {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d MMMM yyyy, HH:mm", { locale: ru });
  };
  
  return (
    <Card>
      <CardHeader className="px-6 py-5 border-b border-neutral-200">
        <CardTitle className="text-lg font-medium text-neutral-800">
          История транзакций
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <div 
                key={transaction.id} 
                className="flex items-center justify-between p-4 rounded-lg bg-neutral-50"
              >
                <div className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.amount > 0 
                      ? "bg-green-100" 
                      : "bg-red-100"
                  }`}>
                    {transaction.amount > 0 ? (
                      <Circle className="h-5 w-5 text-green-600 fill-current" />
                    ) : (
                      <ShoppingCart className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-800">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {formatDate(transaction.createdAt)}
                    </p>
                    {transaction.txHash && (
                      <a 
                        href={`https://testnet.bscscan.com/tx/${transaction.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary flex items-center mt-1 hover:underline"
                      >
                        Посмотреть транзакцию
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Circle className="h-4 w-4 text-amber-500 fill-current" />
                  <span className={transaction.amount > 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                    {transaction.amount > 0 ? `+${transaction.amount}` : transaction.amount}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-neutral-500">
              История транзакций пуста
            </div>
          )}
        </div>
        
        {showMoreLink && transactions.length > 0 && (
          <div className="mt-6 text-center">
            <a href="#" className="text-primary hover:text-primary/90 text-sm font-medium">
              Показать больше транзакций
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
