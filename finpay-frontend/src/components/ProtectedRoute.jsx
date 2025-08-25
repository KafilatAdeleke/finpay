import { Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function ProtectedRoute({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Optional: Validate token (e.g., check expiry)
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}