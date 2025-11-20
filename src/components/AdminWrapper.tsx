import { useLocation } from 'react-router-dom';

interface AdminWrapperProps {
  children: React.ReactNode;
}

export const AdminWrapper = ({ children }: AdminWrapperProps) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return <>{children}</>;
};

