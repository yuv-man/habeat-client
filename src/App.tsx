import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Registration from "./pages/Registration";
import Dashboard from "./pages/Dashboard";
import Goals from "./pages/Goals";
import Recipes from "./pages/Recipes";
import NotFound from "./pages/NotFound";
import OAuthCallback from "./components/auth/OAuthCallback";
import ShoppingList from "./pages/ShoppingList";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/shopping-list" element={<ShoppingList />} />  
            <Route path="/auth/callback" element={<OAuthCallback />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
