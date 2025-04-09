import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Reward } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Gift, Trophy, Tag } from "lucide-react";
import RewardCard from "@/components/reward-card";

const RewardsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<string>("available");

  // Fetch rewards
  const { data: rewards, isLoading } = useQuery<Reward[]>({
    queryKey: ["/api/rewards", filter],
    queryFn: async () => {
      const response = await fetch(`/api/rewards?status=${filter}`);
      if (!response.ok) {
        throw new Error("Failed to fetch rewards");
      }
      return response.json();
    },
  });

  // Filter rewards by search query
  const filteredRewards = rewards?.filter(reward => 
    reward.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reward.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-display font-bold text-neutral-800 sm:text-3xl">Награды</h1>
          <p className="mt-1 text-sm text-neutral-500">
            На что можно потратить заработанные OmSUCoin
          </p>
        </div>
      </div>
      
      {/* Student Tag Balance Card */}
      <Card className="mb-8 border border-neutral-200">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-medium text-neutral-800">Ваш баланс</h2>
              <p className="mt-1 text-sm text-neutral-500">Доступно для обмена на награды</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-2 bg-amber-100 px-4 py-2 rounded-lg">
              <Tag className="h-5 w-5 text-amber-500" />
              <span className="text-2xl font-bold text-amber-700">{user?.tokenBalance || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <label htmlFor="reward-filter" className="block text-sm font-medium text-neutral-700 mb-1">Фильтр</label>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger id="reward-filter">
                  <SelectValue placeholder="Все награды" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все награды</SelectItem>
                  <SelectItem value="available">Доступные</SelectItem>
                  <SelectItem value="unavailable">Недоступные</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label htmlFor="reward-search" className="block text-sm font-medium text-neutral-700 mb-1">Поиск</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-neutral-400" />
                </div>
                <Input 
                  id="reward-search" 
                  className="pl-10" 
                  placeholder="Поиск наград..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Rewards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="opacity-60">
              <CardContent className="p-5 h-48 animate-pulse flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/4 ml-auto"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredRewards && filteredRewards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRewards.map((reward) => (
            <RewardCard key={reward.id} reward={reward} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-800 mb-2">Награды не найдены</h3>
          <p className="text-neutral-500">Попробуйте изменить параметры поиска или фильтрации</p>
        </div>
      )}
    </div>
  );
};

export default RewardsPage;
