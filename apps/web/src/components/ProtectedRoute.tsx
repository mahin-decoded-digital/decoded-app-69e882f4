import { Navigate, Outlet, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  allow: boolean;
}

export const ProtectedRoute = ({ allow }: ProtectedRouteProps) => {
  const location = useLocation();

  if (!allow) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};
