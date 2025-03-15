import { useEffect, useState } from "react";
import { useOCAuth } from "@opencampus/ocid-connect-js";
import { useNavigate } from "react-router-dom";

const OCIDDashboard = () => {
  const { isInitialized, authState, OCId, ethAddress } = useOCAuth();
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if this is the first visit after authentication
    const isNewLogin = localStorage.getItem("auth_completed") === "true";

    if (isNewLogin) {
      // Clear the flag
      localStorage.removeItem("auth_completed");
      console.log("User has just authenticated");
    }
  }, []);

  useEffect(() => {
    // Only check authentication after initialization and a short delay
    if (isInitialized) {
      // Add a slight delay to allow auth state to stabilize
      const timer = setTimeout(() => {
        console.log("Auth state:", authState);
        if (!authState.isAuthenticated) {
          console.log("Not authenticated, redirecting to home");
          navigate("/");
        }
        setCheckingAuth(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isInitialized, authState, navigate]);

  if (!isInitialized || checkingAuth) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <div>
        <h2>Welcome!</h2>
        <p>Your OC ID: {OCId || "Not available"}</p>
        <p>Your ETH Address: {ethAddress || "Not available"}</p>

        {/* Display user information */}
        {authState.userInfo ? (
          <div>
            <h3>Your Profile</h3>
            <pre>{JSON.stringify(authState.userInfo, null, 2)}</pre>
          </div>
        ) : (
          <p>User information not available yet</p>
        )}
      </div>
    </div>
  );
};

export default OCIDDashboard;
