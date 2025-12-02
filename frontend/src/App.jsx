// src/App.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';
import './styles/App.css';
import './styles/modalStyle.css';

/** Root component of the application.
 * @returns {React.ReactNode} The application component.
 */
function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Project management</h1>
        <nav>
          {!user && (
            <>
              <Link to="/login">
                <button>Log in</button>
              </Link>
              <Link to="/register">
                <button>Sign up</button>
              </Link>
            </>
          )}
          {user && (
            <>
              <Link to="/projects">
                <button>{user.username}</button>
              </Link>
              <button onClick={handleLogout}>Log out</button>
            </>
          )}
        </nav>
      </header>

      <main>
        <AppRoutes />
      </main>
    </div>
  );
}

export default App;