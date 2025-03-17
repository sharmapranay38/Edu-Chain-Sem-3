import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { OCConnect } from "@opencampus/ocid-connect-js";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DApp from "./pages/DApp";
import Dashboard from "./pages/Dashboard";
import OCIDDashboard from "./components/OCIDDashboard";
import Redirect from "./pages/Redirect";
import LoginPage from "./components/LoginPage";
const queryClient = new QueryClient();

const App = () => {
  // Configure Open Campus ID authentication
  const ocidConfig = {
    redirectUri: window.location.origin + "/redirect",
    referralCode: "PARTNER6",
    clientId: "edubounty-app", // Added clientId for OCID
    scope: "openid profile email", // Added scope for OCID
    // Add any other configuration options needed
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <OCConnect opts={ocidConfig} sandboxMode={true}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dapp" element={<DApp />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/ocid-dashboard" element={<OCIDDashboard />} />
              <Route path="/redirect" element={<Redirect />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </OCConnect>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
