import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PrivateRouteProps {
  children?: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center font-bold text-white text-2xl shadow-lg animate-pulse">
          F
        </div>
        <div className="flex items-center gap-2 text-on-surface-variant font-medium text-sm">
          <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
          <span>Carregando sessão...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : null;
};
