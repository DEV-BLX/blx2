import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import { Header } from "@/components/layout/header";
import Home from "@/pages/home";
import SignIn from "@/pages/sign-in";
import SignUp from "@/pages/sign-up";
import Companies from "@/pages/companies";
import CompanyCard from "@/pages/company-card";
import CompanyEdit from "@/pages/company-edit";
import Dashboard from "@/pages/dashboard";
import Placeholder from "@/pages/placeholder";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

const placeholderRoutes = [
  "/services",
  "/tools",
  "/assessment",
  "/kitchen",
  "/book",
  "/consultants",
  "/owner-exchange",
  "/saved",
  "/notifications",
  "/account",
  "/echo-pricing",
  "/credits",
  "/challenges",
  "/bookings",
  "/posts",
  "/profile",
  "/compensation",
  "/admin/dashboard",
  "/admin/companies",
  "/admin/consumers",
  "/admin/consultants",
  "/admin/bookings",
  "/admin/owner-exchange",
  "/admin/echo-pricing",
  "/admin/credits",
  "/admin/finance",
  "/admin/notifications",
  "/admin/joe",
  "/admin/audit-logs",
  "/admin/settings",
];

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/sign-in" component={SignIn} />
      <Route path="/sign-up" component={SignUp} />
      <Route path="/companies" component={Companies} />
      <Route path="/company/edit" component={CompanyEdit} />
      <Route path="/company/:id" component={CompanyCard} />
      <Route path="/dashboard" component={Dashboard} />
      {placeholderRoutes.map((path) => (
        <Route key={path} path={path}>
          <Placeholder path={path} />
        </Route>
      ))}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <AuthProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <div className="min-h-screen bg-background">
                <Header />
                <AppRouter />
              </div>
            </WouterRouter>
          </AuthProvider>
        </ThemeProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
