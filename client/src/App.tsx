import { FC } from 'react';
import { Switch, Route, Routes } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ActivitiesPage from "@/pages/activities-page";
import LeaderboardPage from "@/pages/leaderboard-page";
import RewardsPage from "@/pages/rewards-page";
import ProfilePage from "@/pages/profile-page";
import CreateActivity from "@/pages/admin/create-activity";
import ActivityParticipants from "@/pages/admin/activity-participants";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";
import AppHeader from "./components/app-header";
import AppFooter from "./components/app-footer";
import { MainLayout } from "./components/main-layout";
import AdminActivitiesPage from "@/pages/admin/activities-page";
import AdminRewardsPage from "@/pages/admin/rewards-page";

const App: FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="auth" element={<AuthPage />} />
            <Route path="activities" element={<ActivitiesPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="rewards" element={<RewardsPage />} />
            <Route path="admin/activities" element={<AdminActivitiesPage />} />
            <Route path="admin/rewards" element={<AdminRewardsPage />} />
          </Route>
        </Routes>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
