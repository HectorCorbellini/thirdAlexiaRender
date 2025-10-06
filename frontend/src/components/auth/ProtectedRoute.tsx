import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user, token } = useAuth();

  // Debug logging
  console.log('🔒 ProtectedRoute Check:', {
    isLoading,
    isAuthenticated,
    hasUser: !!user,
    hasToken: !!token
  });

  if (isLoading) {
    console.log('⏳ Still loading authentication state...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('❌ Not authenticated - redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('✅ Authenticated - rendering protected content');
  return <>{children}</>;
};
