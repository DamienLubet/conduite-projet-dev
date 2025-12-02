import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './../../context/AuthContext.jsx';

const API_BASE_URL = '/api';

/**
 * Login component for user authentication.
 * Handles user input, form submission, and error display.
 * 
 * @return {JSX.Element} The rendered Login component.
 */
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Handles login form submission.
   *
   * @param {React.FormEvent<HTMLFormElement>} e - Form submit event.
   * @return {Promise<void>}
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Error during login');
      }

      login(data.data.user, data.data.token);
      navigate('/projects');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Log in</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
        <p>
          Don't have an account yet?{' '}
          <Link to="/register" className="link-button">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
