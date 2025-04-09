import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tag, Calendar, MapPin, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Redirect } from "wouter";

// Activity schema with zod validation
const activitySchema = z.object({
  title: z.string().min(5, "Название должно содержать минимум 5 символов"),
  description: z.string().min(10, "Описание должно содержать минимум 10 символов"),
  tokens: z.coerce.number().min(1, "Количество токенов должно быть больше 0"),
  date: z.string().refine(value => !!value, "Выберите дату и время"),
  location: z.string().min(3, "Укажите место проведения"),
  maxParticipants: z.coerce.number().optional(),
  status: z.enum(["open", "closed", "completed"]).default("open"),
});

type ActivityForm = z.infer<typeof activitySchema>;

const CreateActivity: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Redirect non-admin users
  if (!isAdmin) {
    return <Redirect to="/" />;
  }
  
  const form = useForm<ActivityForm>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      title: "",
      description: "",
      tokens: 0,
      date: "",
      location: "",
      maxParticipants: undefined,
      status: "open",
    },
  });
  
  const onSubmit = async (data: ActivityForm) => {
    try {
      // Format date to ISO
      const formattedData = {
        ...data,
        date: new Date(data.date).toISOString(),
        createdBy: user!.id,
      };
      
      const response = await apiRequest("POST", "/api/activities", formattedData);
      const activity = await response.json();
      
      toast({
        title: "Активность создана",
        description: "Новая активность успешно создана",
      });
      
      // Navigate to the activities page
      navigate("/activities");
    } catch (error) {
      console.error("Error creating activity:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать активность",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-neutral-800 sm:text-3xl">Создание активности</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Создайте новую активность для студентов
        </p>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Название активности</FormLabel>
                        <FormControl>
                          <Input placeholder="Например: Студенческая конференция по AI" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Описание</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Подробное описание активности..." 
                            rows={4} 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="tokens"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Токены за участие</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Tag className="h-4 w-4 text-amber-500" />
                          </div>
                          <Input 
                            type="number" 
                            placeholder="50" 
                            className="pl-10" 
                            {...field}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              field.onChange(isNaN(value) ? 0 : value);
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="maxParticipants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Максимальное количество участников</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Users className="h-4 w-4 text-neutral-400" />
                          </div>
                          <Input 
                            type="number" 
                            placeholder="50" 
                            className="pl-10" 
                            {...field}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              field.onChange(isNaN(value) ? undefined : value);
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Оставьте пустым для неограниченного количества
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Дата и время проведения</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar className="h-4 w-4 text-neutral-400" />
                          </div>
                          <Input 
                            type="datetime-local" 
                            className="pl-10" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Место проведения</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MapPin className="h-4 w-4 text-neutral-400" />
                          </div>
                          <Input 
                            placeholder="Например: Главный корпус, аудитория 214" 
                            className="pl-10" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="mt-8 flex justify-end space-x-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/activities")}
                >
                  Отмена
                </Button>
                <Button 
                  type="submit" 
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Создание..." : "Создать активность"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateActivity;
