"use client";
import { useOCAuth } from "@opencampus/ocid-connect-js";

export default function LoginButton() {
  const { isInitialized, authState, ocAuth } = useOCAuth();

  const handleLogin = async () => {
    try {
      if (ocAuth && typeof ocAuth.signInWithRedirect === "function") {
        await ocAuth.signInWithRedirect({ state: "opencampus" });
      } else {
        console.error("signInWithRedirect method not available:", ocAuth);
      }
    } catch (error) {
      console.error("Login error:", error);
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
        disabled
        className="px-4 py-2 bg-green-500 text-white rounded cursor-not-allowed"
      >
        Logged In
      </button>
    );
  }

  return (
    <button
      onClick={handleLogin}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Login with OpenCampus
    </button>
  );
}
