import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, Registration } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import ActivityCard from "@/components/activity-card";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const ActivitiesPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  // Fetch activities
  const { data: activities, isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities", filter],
    queryFn: async () => {
      const response = await fetch(`/api/activities?status=${filter}`);
      if (!response.ok) {
        throw new Error("Failed to fetch activities");
      }
      return response.json();
    },
  });

  // Fetch user registrations
  const { data: registrations, isLoading: registrationsLoading } = useQuery<Registration[]>({
    queryKey: ["/api/my/registrations"],
    queryFn: async () => {
      const response = await fetch("/api/my/registrations");
      if (!response.ok) {
        throw new Error("Failed to fetch registrations");
      }
      return response.json();
    },
  });

  // Filter activities by search query
  const filteredActivities = activities?.filter(activity => 
    activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Paginate filtered activities
  const paginatedActivities = filteredActivities?.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // Find registration for current activity
  const findRegistration = (activityId: number) => {
    return registrations?.find(reg => reg.activityId === activityId);
  };

  // Total pages calculation
  const totalPages = Math.ceil((filteredActivities?.length || 0) / pageSize);

  // Reset to page 1 when search query or filter changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery, filter]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-display font-bold text-neutral-800 sm:text-3xl">Активности</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Участвуйте в мероприятиях и зарабатывайте OmSUCoin
          </p>
        </div>
        
        {isAdmin && (
          <div className="mt-4 md:mt-0">
            <Button asChild className="inline-flex items-center">
              <Link href="/admin/create-activity">
                <Plus className="mr-2 h-4 w-4" />
                Создать активность
              </Link>
            </Button>
          </div>
        )}
      </div>
      
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <label htmlFor="activity-filter" className="block text-sm font-medium text-neutral-700 mb-1">Фильтр</label>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger id="activity-filter">
                  <SelectValue placeholder="Все активности" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все активности</SelectItem>
                  <SelectItem value="open">Предстоящие</SelectItem>
                  <SelectItem value="completed">Прошедшие</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label htmlFor="activity-search" className="block text-sm font-medium text-neutral-700 mb-1">Поиск</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-neutral-400" />
                </div>
                <Input 
                  id="activity-search" 
                  className="pl-10" 
                  placeholder="Поиск активностей..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Activities Grid */}
      {activitiesLoading || registrationsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="opacity-60">
              <CardContent className="p-5 h-64 animate-pulse flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-8 bg-gray-200 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : paginatedActivities && paginatedActivities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedActivities.map((activity) => (
            <ActivityCard 
              key={activity.id} 
              activity={activity} 
              userRegistration={findRegistration(activity.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-neutral-800 mb-2">Активности не найдены</h3>
          <p className="text-neutral-500">Попробуйте изменить параметры поиска или фильтрации</p>
        </div>
      )}
      
      {/* Pagination */}
      {filteredActivities && filteredActivities.length > 0 && (
        <div className="mt-10">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  disabled={page === 1} 
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }).map((_, index) => {
                const pageNumber = index + 1;
                // Show first page, current page, last page, and pages adjacent to current page
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= page - 1 && pageNumber <= page + 1)
                ) {
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        isActive={page === pageNumber}
                        onClick={() => setPage(pageNumber)}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                
                // Show ellipsis for page gaps
                if (pageNumber === 2 && page > 3) {
                  return (
                    <PaginationItem key="ellipsis-start">
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                
                if (pageNumber === totalPages - 1 && page < totalPages - 2) {
                  return (
                    <PaginationItem key="ellipsis-end">
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                
                return null;
              })}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                  disabled={page === totalPages} 
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          
          <div className="mt-2 text-center text-sm text-neutral-500">
            Показано <span className="font-medium">{paginatedActivities?.length || 0}</span> из{" "}
            <span className="font-medium">{filteredActivities?.length || 0}</span> активностей
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivitiesPage;
