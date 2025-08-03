import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";

// Protected routing used for only when a User is logged into account
interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;