import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const AuthContext = createContext();

// Get API URL from environment
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Setup axios defaults
axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Request interceptor to add auth token
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (auth?.accessToken) {
          config.headers.Authorization = `Bearer ${auth.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => axios.interceptors.request.eject(requestInterceptor);
  }, [auth]);

  // Response interceptor to handle token refresh
  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const response = await axios.get("/api/auth/refresh");
            const newAccessToken = response.data.accessToken;
            
            setAuth(prev => ({
              ...prev,
              accessToken: newAccessToken,
              user: response.data.user
            }));

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            // Refresh failed, logout user
            logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(responseInterceptor);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("/api/auth/refresh");
        setAuth({
          accessToken: res.data.accessToken,
          user: res.data.user
        });
      } catch (error) {
        setAuth(null);
        // Only redirect to login if not already on login/register page
        if (!location.pathname.includes('/login') && !location.pathname.includes('/register')) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate, location.pathname]);

  const login = async (email, password) => {
    try {
      setError(null);
      const res = await axios.post("/api/auth/login", { email, password });
      
      setAuth({
        accessToken: res.data.accessToken,
        user: res.data.user
      });

      // Redirect based on role
      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else if (res.data.user.role === 'manager') {
        navigate('/manager');
      } else {
        navigate('/dashboard');
      }

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      setError(message);
      return { success: false, message };
    }
  };

  const register = async (username, email, password) => {
    try {
      setError(null);
      const res = await axios.post("/api/auth/register", { username, email, password });
      
      // Auto-login after registration
      return await login(email, password);
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      setError(message);
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await axios.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setAuth(null);
      navigate('/login');
    }
  };

  const updateUser = (userData) => {
    setAuth(prev => ({
      ...prev,
      user: { ...prev.user, ...userData }
    }));
  };

  const hasRole = (role) => {
    return auth?.user?.role === role;
  };

  const hasAnyRole = (...roles) => {
    return roles.includes(auth?.user?.role);
  };

  const canAccess = (requiredRoles) => {
    if (!auth) return false;
    return requiredRoles.includes(auth.user.role);
  };

  return (
    <AuthContext.Provider value={{
      auth,
      loading,
      error,
      login,
      register,
      logout,
      updateUser,
      hasRole,
      hasAnyRole,
      canAccess,
      setError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);