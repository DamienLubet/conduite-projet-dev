// src/App.jsx
import { Link, useNavigate } from 'react-router-dom';
import './App.css';
import { useAuth } from './context/AuthContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';

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

      <main className="app-main">
        <AppRoutes />
      </main>
    </div>
  );
}

export default App;