import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, School, Tag } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const AppHeader: React.FC = () => {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getInitials = (name?: string, surname?: string) => {
    if (!name || !surname) return "СТ";
    return `${name[0]}${surname[0]}`.toUpperCase();
  };

  const isAdmin = user?.role === "admin";

  const navLinks = [
    { href: "/", label: "Главная", active: location === "/" },
    { href: "/activities", label: "Активности", active: location === "/activities" },
    { href: "/leaderboard", label: "Рейтинг", active: location === "/leaderboard" },
    { href: "/rewards", label: "Награды", active: location === "/rewards" },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center">
              <span className="text-primary text-3xl">
                <School className="h-8 w-8" />
              </span>
              <span className="font-display font-bold text-primary text-xl ml-2">OmSU</span>
              <span className="font-display font-bold text-amber-500 text-xl">Coin</span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={
                  link.active 
                    ? "text-primary border-b-2 border-primary px-3 py-2 font-medium text-sm" 
                    : "text-neutral-700 hover:text-primary px-3 py-2 font-medium text-sm"
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>
          
          {/* Auth Controls */}
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-neutral-100 rounded-full px-3 py-1">
                <Tag className="h-4 w-4 text-amber-500" />
                <span className="text-amber-600 font-semibold">{user.tokenBalance}</span>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 focus:outline-none">
                    <Avatar className="h-8 w-8 bg-primary-100">
                      <AvatarFallback className="bg-primary-100 text-primary">
                        {getInitials(user.name, user.surname)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-neutral-700">
                      {user.pseudonym || `Student${user.id}`}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="end">
                  {isAdmin && <DropdownMenuLabel>Администратор</DropdownMenuLabel>}
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Профиль</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/activities">Мои активности</Link>
                  </DropdownMenuItem>
                  
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Управление</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/create-activity">Создать активность</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link href="/auth">
                <Button variant="outline">Войти</Button>
              </Link>
              <Link href="/auth">
                <Button>Регистрация</Button>
              </Link>
            </div>
          )}
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="py-4 space-y-4">
                  <div className="flex items-center mb-8">
                    <span className="text-primary text-3xl">
                      <School className="h-8 w-8" />
                    </span>
                    <span className="font-display font-bold text-primary text-xl ml-2">OmSU</span>
                    <span className="font-display font-bold text-amber-500 text-xl">Coin</span>
                  </div>
                  
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={
                        link.active
                          ? "block px-3 py-2 rounded-md text-base font-medium bg-primary-50 text-primary-700"
                          : "block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-neutral-100"
                      }
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  
                  {user && isAdmin && (
                    <>
                      <div className="pt-4 border-t border-neutral-200">
                        <p className="px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                          Администрирование
                        </p>
                        <Link
                          href="/admin/create-activity"
                          className="block px-3 py-2 mt-2 rounded-md text-base font-medium text-neutral-700 hover:bg-neutral-100"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Создать активность
                        </Link>
                      </div>
                    </>
                  )}
                  
                  {user && (
                    <div className="pt-4 border-t border-neutral-200">
                      <Link
                        href="/profile"
                        className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-neutral-100"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Профиль
                      </Link>
                      <Button
                        variant="ghost"
                        className="w-full justify-start px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-neutral-100"
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                      >
                        Выйти
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
