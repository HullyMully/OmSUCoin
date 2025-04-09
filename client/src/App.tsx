import { Switch, Route } from "wouter";
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

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-grow">
        <Switch>
          <Route path="/auth" component={AuthPage} />
          <ProtectedRoute path="/" component={HomePage} />
          <ProtectedRoute path="/activities" component={ActivitiesPage} />
          <ProtectedRoute path="/leaderboard" component={LeaderboardPage} />
          <ProtectedRoute path="/rewards" component={RewardsPage} />
          <ProtectedRoute path="/profile" component={ProfilePage} />
          <ProtectedRoute path="/admin/create-activity" component={CreateActivity} />
          <ProtectedRoute path="/admin/activity/:id" component={ActivityParticipants} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <AppFooter />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
