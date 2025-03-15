import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { OCConnect, LoginCallBack } from "@opencampus/ocid-connect-js";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DApp from "./pages/DApp";
import Dashboard from "./pages/Dashboard";
import OCIDDashboard from "./components/OCIDDashboard";
const queryClient = new QueryClient();

// Define simple custom components for loading and error states
const CustomLoadingComponent = () => <div>Loading authentication...</div>;
const CustomErrorComponent = () => <div>Authentication error occurred</div>;

const App = () => {
  const opts = {
    redirectUri: "http://localhost:8080/ocid-dashboard",
    referralCode: "PARTNER6",
  };

  const handleLoginSuccess = () => {
    window.location.href = "/ocid-dashboard";
  };

  const handleLoginError = (error) => {
    console.error("Login failed:", error);
    window.location.href = "/";
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <OCConnect opts={opts} sandboxMode={true}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dapp" element={<DApp />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/ocid-dashboard" element={<OCIDDashboard />} />
              <Route
                path="/redirect"
                element={
                  <LoginCallBack
                    successCallback={handleLoginSuccess}
                    errorCallback={handleLoginError}
                    customErrorComponent={CustomErrorComponent}
                    customLoadingComponent={CustomLoadingComponent}
                  />
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </OCConnect>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
