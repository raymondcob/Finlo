import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      // Clear any auth pages from history
      window.history.pushState(null, "", location.pathname);
      window.history.replaceState(null, "", location.pathname);

      const handlePopState = () => {
        // Force stay on current page
        window.history.pushState(null, "", location.pathname);
      };

      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    }
  }, [user, location.pathname]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? children : <Navigate to="/auth" />;
};

export default PrivateRoute;
