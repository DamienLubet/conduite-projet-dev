import { Navigate, Route, Routes } from 'react-router-dom';
import Login from '../components/auth/Login.jsx';
import Register from '../components/auth/Register.jsx';
import ProjectList from '../components/projects/ProjectList.jsx';
import ProjectPage from '../components/projects/ProjectPage.jsx';
import ProjectSettings from '../components/projects/ProjectSettings.jsx';
import SprintList from '../components/sprints/SprintList.jsx';
import UserStoryList from '../components/userstories/UserStoryList.jsx';
import VersionList from '../components/version/VersionList.jsx';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Component to protect routes that require authentication.
 * @param {Object} props - Component properties.
 * @param {React.ReactNode} props.children - Child components.
 */
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

/**
 * Component to define application routes.
 * @returns {React.ReactNode} The application routes.
 */
export default function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          !user ? (
            <div className="home">
              <div className="home-box">
                <h2>Welcome to the project management app</h2>
                <p>Please log in or sign up to manage your projects.</p>
              </div>
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
            <ProjectList />

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
        <Route path="releases" element={<VersionList />} />
        <Route path="sprints" element={<SprintList />} />
        <Route path="settings" element={<ProjectSettings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}