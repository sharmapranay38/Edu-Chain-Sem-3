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
import TaskCreation from "./components/TaskCreation";
import { Web3Provider } from "@/contexts/Web3Context";

const queryClient = new QueryClient();

const App = () => {
  // Configure Open Campus ID authentication
  const ocidConfig = {
    redirectUri: window.location.origin + "/redirect",
    referralCode: "PARTNER6",
    // Add any other configuration options needed
    // clientId: "your-client-id", // If required by Open Campus
  };

  return (
    <Web3Provider>
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
                <Route path="/create-task" element={<TaskCreation />} />
                <Route path="/ocid-dashboard" element={<OCIDDashboard />} />
                <Route path="/redirect" element={<Redirect />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </OCConnect>
        </TooltipProvider>
      </QueryClientProvider>
    </Web3Provider>
  );
};

export default App;
