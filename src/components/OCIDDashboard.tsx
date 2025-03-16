import { useEffect, useState, useCallback } from "react";
import { useOCAuth } from "@opencampus/ocid-connect-js";
import { useNavigate } from "react-router-dom";

const OCIDDashboard = () => {
  const { isInitialized, authState, OCId, ethAddress, ocAuth } = useOCAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    // Check if this is the first visit after authentication
    const isNewLogin = localStorage.getItem("auth_completed") === "true";

    if (isNewLogin) {
      // Clear the flag
      localStorage.removeItem("auth_completed");
      // Set a flag to indicate successful authentication
      localStorage.setItem("auth_success", "true");
      console.log("User has just authenticated");
    }

    // Clear any auth in progress flag
    localStorage.removeItem("auth_in_progress");
  }, []);

  useEffect(() => {
    // Only check authentication after initialization
    if (isInitialized) {
      console.log("Auth state:", authState);

      if (!authState.isAuthenticated) {
        console.log("Not authenticated, redirecting to home");
        navigate("/");
      }

      setLoading(false);
    }
  }, [isInitialized, authState, navigate]);

  const handleLogout = useCallback(async () => {
    try {
      setLoggingOut(true);
      if (ocAuth && typeof ocAuth.logout === "function") {
        // Pass the origin as the post-logout redirect URL
        await ocAuth.logout(window.location.origin);
        
        // Clear any auth flags
        localStorage.removeItem("auth_success");
        localStorage.removeItem("auth_completed");
        localStorage.removeItem("auth_in_progress");
        
        // Force redirect to home page to ensure user lands there
        window.location.href = "/";
      } else {
        console.error("Logout function not available:", ocAuth);
        setLoggingOut(false);
      }
    } catch (error) {
      console.error("Logout error:", error);
      setLoggingOut(false);
      // Even on error, try to redirect to home
      navigate("/");
    }
  }, [ocAuth, navigate]);

  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Open Campus ID Dashboard
            </h1>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className={`px-4 py-2 rounded transition-colors ${
                loggingOut
                  ? "bg-red-300 text-white cursor-not-allowed"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
            >
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h2 className="text-xl font-semibold text-blue-800 mb-2">
              Welcome!
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded border border-blue-100">
                <p className="text-sm text-gray-500 mb-1">Your OC ID</p>
                <p className="font-mono text-blue-700 break-all">
                  {OCId || "Not available"}
                </p>
              </div>
              <div className="bg-white p-3 rounded border border-blue-100">
                <p className="text-sm text-gray-500 mb-1">Your ETH Address</p>
                <p className="font-mono text-blue-700 break-all">
                  {ethAddress || "Not available"}
                </p>
              </div>
            </div>
          </div>

          {/* Display user information */}
          {authState.userInfo ? (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Your Profile
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg overflow-auto">
                <pre className="text-sm">
                  {JSON.stringify(authState.userInfo, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
              <p className="text-yellow-700">
                User information not available yet
              </p>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OCIDDashboard;
