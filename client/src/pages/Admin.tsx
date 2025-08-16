import React from "react";
import { useState, useEffect } from "react";
import AdminDashboardSimple from "../components/AdminDashboardSimple";
import AdminPasswordProtection from "../components/AdminPasswordProtection";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated in this session
    const authenticated = sessionStorage.getItem("adminAuthenticated");
    setIsAuthenticated(authenticated === "true");
    setIsLoading(false);
  }, []);

  const handleAuthenticate = () => {
    setIsAuthenticated(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-bluebonnet-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminPasswordProtection onAuthenticate={handleAuthenticate} />;
  }

  return <AdminDashboardSimple />;
}