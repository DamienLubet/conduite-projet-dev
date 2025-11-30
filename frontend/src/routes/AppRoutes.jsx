import { Navigate, Route, Routes } from 'react-router-dom';
import Login from '../components/auth/Login.jsx';
import Register from '../components/auth/Register.jsx';
import ProjectList from '../components/projects/ProjectList.jsx';
import ProjectPage from '../components/projects/ProjectPage.jsx';
import UserStoryList from '../components/userstories/UserStoryList.jsx';
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
            <ProjectList/>
            
          </PrivateRoute>
        }
      />
      <Route
        path="/projects/:projectId"
        element={
          <PrivateRoute>
            <ProjectPage />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="backlog" replace />} />
        <Route path="backlog" element={<UserStoryList />} />
        <Route path="sprints" element={<div>Sprints - Coming soon</div>} />
        <Route path="tasks" element={<div>Tasks - Coming soon</div>} />
        <Route path="settings" element={<div>Settings - Coming soon</div>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}