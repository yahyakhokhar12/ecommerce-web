import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export const AdminRoute = ({ children }) => {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Navigate to="/login" replace />;
  return children;
};
