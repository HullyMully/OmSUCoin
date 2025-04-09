import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { School, Wallet, ShieldCheck } from "lucide-react";
import { Redirect } from "wouter";
import { InsertUser, LoginUser } from "@shared/schema";

const loginSchema = z.object({
  email: z.string().email({ message: "Введите корректный email" }),
  password: z.string().min(6, { message: "Пароль должен быть не менее 6 символов" }),
});

const registerSchema = z.object({
  name: z.string().min(2, { message: "Введите имя" }),
  surname: z.string().min(2, { message: "Введите фамилию" }),
  studentId: z.string().min(5, { message: "Введите номер студенческого билета" }),
  email: z.string().email({ message: "Введите корректный email" }),
  pseudonym: z.string().optional(),
  faculty: z.string().min(1, { message: "Выберите факультет" }),
  password: z.string().min(6, { message: "Пароль должен быть не менее 6 символов" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

const AuthPage: React.FC = () => {
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("login");
  
  // Login form
  const loginForm = useForm<LoginUser>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  // Register form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      surname: "",
      studentId: "",
      email: "",
      pseudonym: "",
      faculty: "",
      password: "",
      confirmPassword: "",
    },
  });
  
  const onLogin = (data: LoginUser) => {
    loginMutation.mutate(data);
  };
  
  const onRegister = (data: z.infer<typeof registerSchema>) => {
    // Remove confirmPassword as it's not part of the InsertUser type
    const { confirmPassword, ...userData } = data;
    registerMutation.mutate(userData as InsertUser);
  };
  
  // Redirect to home if user is already authenticated
  if (user) {
    return <Redirect to="/" />;
  }
  
  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="order-2 lg:order-1">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Вход в систему</CardTitle>
                  <CardDescription>
                    Войдите в свой аккаунт для доступа к платформе OmSUCoin
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="example@omsu.ru" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Пароль</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                        {loginMutation.isPending ? "Вход..." : "Войти"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col">
                  <div className="relative w-full my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-neutral-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-neutral-500">
                        Или войдите через
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Button variant="outline" disabled>
                      <Wallet className="mr-2 h-4 w-4" />
                      Подключить MetaMask
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        loginForm.setValue("email", "admin@omsu.ru");
                        loginForm.setValue("password", "admin123");
                        setActiveTab("login");
                      }}
                    >
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Вход для админа
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Регистрация</CardTitle>
                  <CardDescription>
                    Создайте аккаунт для участия в активностях и получения токенов
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Имя</FormLabel>
                              <FormControl>
                                <Input placeholder="Иван" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="surname"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Фамилия</FormLabel>
                              <FormControl>
                                <Input placeholder="Петров" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={registerForm.control}
                        name="studentId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Номер студенческого билета</FormLabel>
                            <FormControl>
                              <Input placeholder="12345678" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="example@omsu.ru" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="pseudonym"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Псевдоним (будет виден другим)</FormLabel>
                            <FormControl>
                              <Input placeholder="CryptoStudent" {...field} />
                            </FormControl>
                            <FormDescription>
                              Если не указан, будет сгенерирован автоматически
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="faculty"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Факультет</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Выберите факультет" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Компьютерных наук">Компьютерных наук</SelectItem>
                                <SelectItem value="Юридический факультет">Юридический факультет</SelectItem>
                                <SelectItem value="Экономический факультет">Экономический факультет</SelectItem>
                                <SelectItem value="Физический факультет">Физический факультет</SelectItem>
                                <SelectItem value="Математический факультет">Математический факультет</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Пароль</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Подтверждение пароля</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                        {registerMutation.isPending ? "Регистрация..." : "Зарегистрироваться"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="order-1 lg:order-2 flex flex-col items-center lg:items-start text-center lg:text-left">
          <div className="flex items-center mb-6">
            <span className="text-primary text-3xl">
              <School className="h-12 w-12" />
            </span>
            <span className="font-display font-bold text-primary text-3xl ml-2">OmSU</span>
            <span className="font-display font-bold text-amber-500 text-3xl">Coin</span>
          </div>
          
          <h1 className="text-4xl font-display font-bold text-neutral-800 mb-6">
            Университетская блокчейн-платформа
          </h1>
          
          <p className="text-lg text-neutral-600 mb-8 max-w-lg">
            Зарабатывайте токены за участие в университетских активностях, 
            отслеживайте свой прогресс в рейтинге и обменивайте токены 
            на вознаграждения и скидки.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-lg">
            <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
              <h3 className="font-medium text-neutral-800 mb-2">Участие в активностях</h3>
              <p className="text-sm text-neutral-600">Получайте токены за участие в конференциях, волонтёрстве и мероприятиях</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
              <h3 className="font-medium text-neutral-800 mb-2">Рейтинг студентов</h3>
              <p className="text-sm text-neutral-600">Соревнуйтесь с другими студентами и получайте признание за активность</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
              <h3 className="font-medium text-neutral-800 mb-2">Блокчейн технология</h3>
              <p className="text-sm text-neutral-600">Прозрачная система вознаграждений на базе блокчейна Binance Smart Chain</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
              <h3 className="font-medium text-neutral-800 mb-2">Ценные награды</h3>
              <p className="text-sm text-neutral-600">Обменивайте токены на скидки, мерч и другие вознаграждения</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
