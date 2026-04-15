import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children, requiredRoles }) {
  const { auth, loading, canAccess } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!auth || !auth.accessToken) {
    return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
  }

  // Check if user has required role(s)
  if (requiredRoles && !canAccess(requiredRoles)) {
    // Redirect to appropriate dashboard based on user role
    const userRole = auth.user.role;
    let redirectPath = '/dashboard';
    
    if (userRole === 'admin') {
      redirectPath = '/admin';
    } else if (userRole === 'manager') {
      redirectPath = '/manager';
    }
    
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}