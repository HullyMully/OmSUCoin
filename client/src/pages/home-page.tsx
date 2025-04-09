import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Activity, Transaction } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { School, Users, Award, Calendar, ArrowRight, CircleDollarSign } from "lucide-react";
import ActivityCard from "@/components/activity-card";
import TransactionHistory from "@/components/transaction-history";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  // Fetch latest activities
  const { data: latestActivities, isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities", "open", 3],
    queryFn: async () => {
      const response = await fetch("/api/activities?status=open&limit=3");
      if (!response.ok) {
        throw new Error("Failed to fetch activities");
      }
      return response.json();
    },
  });

  // Fetch user transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/my/transactions", 5],
    queryFn: async () => {
      const response = await fetch("/api/my/transactions?limit=5");
      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }
      return response.json();
    },
  });

  // Fetch leaderboard for top 5 users
  const { data: topUsers, isLoading: leaderboardLoading } = useQuery({
    queryKey: ["/api/leaderboard", 5],
    queryFn: async () => {
      const response = await fetch("/api/leaderboard?limit=5");
      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard");
      }
      return response.json();
    },
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/90 to-primary rounded-lg shadow-md p-8 mb-10 text-white">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">
              Добро пожаловать, {user?.name || "Студент"}!
            </h1>
            <p className="opacity-90 max-w-2xl mb-6">
              OmSUCoin — это блокчейн-платформа для студентов ОмГУ. Участвуйте в активностях,
              зарабатывайте токены и обменивайте их на ценные награды.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="secondary" asChild>
                <Link href="/activities">
                  Найти активности
                </Link>
              </Button>
              <Button variant="outline" className="bg-transparent text-white border-white hover:bg-white/10" asChild>
                <Link href="/profile">
                  Мой профиль
                </Link>
              </Button>
            </div>
          </div>
          <div className="mt-6 md:mt-0">
            <div className="bg-white/10 backdrop-blur rounded-lg p-5 text-center">
              <p className="text-sm font-medium mb-1">Ваш баланс</p>
              <div className="flex items-center justify-center gap-2">
                <CircleDollarSign className="h-5 w-5 text-amber-200" />
                <span className="text-3xl font-bold">{user?.tokenBalance}</span>
              </div>
              <p className="text-xs mt-2 opacity-80">OmSUCoin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="bg-primary-100 p-3 rounded-lg mr-4">
              <School className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Токенов</p>
              <p className="text-2xl font-semibold">{user?.tokenBalance}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="bg-amber-100 p-3 rounded-lg mr-4">
              <Award className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Ваше место</p>
              <p className="text-2xl font-semibold">
                {topUsers?.findIndex((u: any) => u.id === user?.id) !== -1 
                  ? `#${topUsers?.findIndex((u: any) => u.id === user?.id) + 1}` 
                  : "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="bg-green-100 p-3 rounded-lg mr-4">
              <Calendar className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Активности</p>
              <p className="text-2xl font-semibold">
                {transactions?.filter(t => t.type === "activity_reward").length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg mr-4">
              <Users className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">С нами с</p>
              <p className="text-xl font-semibold">
                {user?.createdAt 
                  ? formatDistanceToNow(new Date(user.createdAt), { addSuffix: true, locale: ru }) 
                  : "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Activities Section */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Предстоящие активности</h2>
            <Button variant="link" asChild>
              <Link href="/activities">
                Все активности <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          {activitiesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(2)].map((_, index) => (
                <Card key={index} className="opacity-60">
                  <CardContent className="p-5 h-48 animate-pulse flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-8 bg-gray-200 rounded w-full"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : latestActivities && latestActivities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {latestActivities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-neutral-500">Нет предстоящих активностей</p>
                {isAdmin && (
                  <Button className="mt-4" asChild>
                    <Link href="/admin/create-activity">Создать активность</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Transactions Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Последние транзакции</h2>
          
          {transactionsLoading ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">История транзакций</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="space-y-4 animate-pulse">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="flex justify-between p-4 rounded-lg bg-neutral-50">
                      <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : transactions && transactions.length > 0 ? (
            <TransactionHistory transactions={transactions} />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-neutral-500">Нет транзакций</p>
                <Button className="mt-4" variant="outline" asChild>
                  <Link href="/activities">Найти активности</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
