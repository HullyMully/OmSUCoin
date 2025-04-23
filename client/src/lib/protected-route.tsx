import { FC, ComponentType } from 'react';
import { Route, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from "lucide-react";
import { Redirect } from "wouter";

interface ProtectedRouteProps {
  component: ComponentType;
  path: string;
  requireRole?: 'admin' | 'student';
}

export const ProtectedRoute: FC<ProtectedRouteProps> = ({
  component: Component,
  path,
  requireRole,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!isAuthenticated) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  if (requireRole && user?.role !== requireRole) {
    setLocation('/');
    return null;
  }

  return <Route path={path} component={Component} />;
};
