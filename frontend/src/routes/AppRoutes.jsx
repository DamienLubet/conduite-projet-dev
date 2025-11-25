import { Navigate, Route, Routes } from 'react-router-dom';
import Login from '../components/auth/Login.jsx';
import Register from '../components/auth/Register.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          !user ? (
            <div className="home">
              <h2>Welcome to the project management app</h2>
              <p>Please log in or sign up to manage your projects.</p>
            </div>
          ) : (
            <Navigate to="/projects" replace />
          )
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/projects"
        element={
          <PrivateRoute>
            <div>Projects Page - Under Construction</div>
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}