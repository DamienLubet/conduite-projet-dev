import { useAuth } from './context/AuthContext.jsx';

export const API_BASE_URL = '/api';

export function useApi() {
  const { token } = useAuth();

  const authFetch = async (path, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.success === false) {
      const message = data.message || 'Erreur API';
      throw new Error(message);
    }
    return data;
  };

  return { authFetch };
}
