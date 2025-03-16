import { useOCAuth } from "@opencampus/ocid-connect-js";
import { useEffect, useState } from "react";

export default function LoginButton() {
  const { isInitialized, authState, ocAuth } = useOCAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Reset loading state when auth state changes
  useEffect(() => {
    if (authState?.isAuthenticated) {
      setIsLoading(false);
    }
  }, [authState]);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      if (ocAuth && typeof ocAuth.signInWithRedirect === "function") {
        // Store a flag to indicate authentication is in progress
        localStorage.setItem("auth_in_progress", "true");
        await ocAuth.signInWithRedirect({ 
          state: "opencampus",
          // You can add additional parameters here if needed
        });
      } else {
        console.error("signInWithRedirect method not available:", ocAuth);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
      // Clear the auth in progress flag on error
      localStorage.removeItem("auth_in_progress");
    }
  };

  if (!isInitialized) {
    return (
      <button
        disabled
        className="px-4 py-2 bg-gray-300 text-gray-500 rounded cursor-not-allowed"
      >
        Loading...
      </button>
    );
  }

  if (authState?.isAuthenticated) {
    return (
      <button
        onClick={() => window.location.href = "/ocid-dashboard"}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Dashboard
      </button>
    );
  }

  return (
    <button
      onClick={handleLogin}
      disabled={isLoading}
      className={`px-4 py-2 text-white rounded ${
        isLoading 
          ? "bg-blue-400 cursor-not-allowed" 
          : "bg-blue-500 hover:bg-blue-600"
      }`}
    >
      {isLoading ? "Connecting..." : "Login with OpenCampus"}
    </button>
  );
}
