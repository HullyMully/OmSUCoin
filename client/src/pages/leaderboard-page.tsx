import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Award, Medal, Search, Tag, Trophy, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface LeaderboardUser {
  id: number;
  pseudonym: string;
  faculty: string;
  tokenBalance: number;
  createdAt: string;
}

const LeaderboardPage: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch leaderboard data
  const { data: leaderboard, isLoading } = useQuery<LeaderboardUser[]>({
    queryKey: ["/api/leaderboard"],
    queryFn: async () => {
      const response = await fetch("/api/leaderboard?limit=100");
      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard");
      }
      return response.json();
    },
  });

  // Find current user's position
  const userPosition = leaderboard?.findIndex((u) => u.id === user?.id) ?? -1;

  // Filter by search
  const filteredLeaderboard = leaderboard?.filter(
    (u) =>
      u.pseudonym.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.faculty && u.faculty.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Get initials for avatar
  const getInitials = (pseudonym: string) => {
    const words = pseudonym.split(/\s+/).filter(Boolean);
    if (words.length === 0) return "?";
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  };
  
  // Table columns
  const columns: ColumnDef<LeaderboardUser>[] = [
    {
      accessorKey: "position",
      header: "Место",
      cell: ({ row }) => {
        const position = row.index + 1;
        
        if (position === 1) {
          return (
            <div className="flex items-center">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center">
                <Trophy className="h-4 w-4 text-white" />
              </div>
            </div>
          );
        } else if (position === 2) {
          return (
            <div className="flex items-center">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-neutral-300 flex items-center justify-center">
                <Medal className="h-4 w-4 text-white" />
              </div>
            </div>
          );
        } else if (position === 3) {
          return (
            <div className="flex items-center">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-amber-600 flex items-center justify-center">
                <Medal className="h-4 w-4 text-white" />
              </div>
            </div>
          );
        } else {
          return (
            <div className="flex items-center">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-neutral-200 flex items-center justify-center">
                <span className="text-neutral-600 font-semibold">{position}</span>
              </div>
            </div>
          );
        }
      },
    },
    {
      accessorKey: "student",
      header: "Студент",
      cell: ({ row }) => {
        const student = row.original;
        const isCurrentUser = student.id === user?.id;
        
        return (
          <div className="flex items-center">
            <Avatar className={`h-10 w-10 ${isCurrentUser ? 'bg-primary-200' : 'bg-primary-100'}`}>
              <AvatarFallback className={isCurrentUser ? 'text-primary-700' : 'text-primary-600'}>
                {getInitials(student.pseudonym)}
              </AvatarFallback>
            </Avatar>
            <div className="ml-4">
              <div className={`text-sm font-medium ${isCurrentUser ? 'text-primary-700' : 'text-neutral-900'}`}>
                {student.pseudonym}
                {isCurrentUser && <span className="ml-2 text-xs bg-primary-100 text-primary-800 px-2 py-0.5 rounded-full">Вы</span>}
              </div>
              <div className="text-xs text-neutral-500">
                Присоединился: {format(new Date(student.createdAt), "MMMM yyyy", { locale: ru })}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "faculty",
      header: "Факультет",
      cell: ({ row }) => {
        return (
          <div className="text-sm text-neutral-900">{row.original.faculty || "Не указан"}</div>
        );
      },
    },
    {
      accessorKey: "tokenBalance",
      header: "Токены",
      cell: ({ row }) => {
        return (
          <div className="flex items-center space-x-2">
            <Tag className="h-4 w-4 text-amber-500" />
            <span className="text-lg font-bold text-amber-700">{row.original.tokenBalance}</span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-display font-bold text-neutral-800 sm:text-3xl">Рейтинг студентов</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Топ студентов по количеству заработанных OmSUCoin
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-6 flex items-center">
            <div className="bg-amber-500 p-3 rounded-lg mr-4">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-amber-800">Первое место</p>
              <p className="text-2xl font-semibold text-amber-900">
                {filteredLeaderboard && filteredLeaderboard.length > 0
                  ? filteredLeaderboard[0].pseudonym
                  : "—"}
              </p>
              <p className="text-sm text-amber-700">
                {filteredLeaderboard && filteredLeaderboard.length > 0
                  ? `${filteredLeaderboard[0].tokenBalance} токенов`
                  : "—"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="bg-primary-100 p-3 rounded-lg mr-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Всего участников</p>
              <p className="text-2xl font-semibold">{leaderboard?.length || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="bg-primary-100 p-3 rounded-lg mr-4">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Ваша позиция</p>
              <p className="text-2xl font-semibold">
                {userPosition !== -1 ? `#${userPosition + 1}` : "Не в рейтинге"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard Table */}
      <Card>
        <CardContent className="p-0">
          <div className="px-4 py-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Поиск по псевдониму или факультету"
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredLeaderboard && filteredLeaderboard.length > 0 ? (
            <DataTable columns={columns} data={filteredLeaderboard} />
          ) : (
            <div className="p-8 text-center text-neutral-500">
              Нет данных для отображения
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaderboardPage;
