import { useEffect, useState } from "react";
import { LoginCallBack, useOCAuth } from "@opencampus/ocid-connect-js";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

// Custom loading component
const LoadingComponent = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
    <div className="text-center p-8 bg-white/90 backdrop-blur-sm rounded-xl shadow-md">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-lg font-medium text-gray-800">Completing authentication...</p>
      <p className="text-sm text-gray-500 mt-2">Please wait while we verify your Open Campus ID</p>
    </div>
  </div>
);

// Custom error component
const ErrorComponent = () => {
  const { authState } = useOCAuth();
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Failed</h2>
        <p className="text-gray-600 mb-6">
          {authState?.error?.message || "There was an error authenticating with Open Campus ID"}
        </p>
        <button 
          onClick={() => navigate("/login")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Return to Login
        </button>
      </div>
    </div>
  );
};

const Redirect = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const handleSuccess = () => {
    console.log("OCID authentication successful");
    // Set a flag to indicate authentication is complete
    localStorage.setItem("auth_completed", "true");
    // Remove the in-progress flag
    localStorage.removeItem("auth_in_progress");
    
    toast({
      title: "Authentication Successful",
      description: "You have successfully logged in with Open Campus ID",
    });
    
    // Redirect to dashboard
    navigate("/ocid-dashboard");
  };

  const handleError = (error: Error) => {
    console.error("Authentication error:", error);
    setError(error);
    // Remove the in-progress flag
    localStorage.removeItem("auth_in_progress");
    
    toast({
      title: "Authentication Failed",
      description: error.message || "Failed to authenticate with Open Campus ID",
      variant: "destructive",
    });
    
    // Wait a moment before redirecting to login
    setTimeout(() => navigate("/login"), 3000);
  };

  return (
    <LoginCallBack
      successCallback={handleSuccess}
      errorCallback={handleError}
      customLoadingComponent={LoadingComponent}
      customErrorComponent={ErrorComponent}
    />
  );
};

export default Redirect;
