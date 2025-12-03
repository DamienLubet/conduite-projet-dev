import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';

// We create a temporary component to "consume" the context and trigger actions
const TestConsumer = () => {
  const { user, token, login, logout, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div data-testid="user-display">
        {user ? `User: ${user.username}` : 'No User'}
      </div>
      <div data-testid="token-display">
        {token ? `Token: ${token}` : 'No Token'}
      </div>
      <button 
        onClick={() => login({ username: 'TestUser' }, 'fake-jwt-token')}
      >
        Login
      </button>
      <button onClick={logout}>
        Logout
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  const renderProvider = () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
  };

  test('provides default null state when localStorage is empty', async () => {
    renderProvider();

    await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('user-display')).toHaveTextContent('No User');
    expect(screen.getByTestId('token-display')).toHaveTextContent('No Token');
  });

  test('restores user session from localStorage on mount', async () => {
    const fakeUser = { username: 'PersistedUser' };
    const fakeToken = 'stored-token-123';
    
    window.localStorage.setItem('authUser', JSON.stringify(fakeUser));
    window.localStorage.setItem('authToken', fakeToken);

    renderProvider();

    await waitFor(() => {
        expect(screen.getByTestId('user-display')).toHaveTextContent('User: PersistedUser');
        expect(screen.getByTestId('token-display')).toHaveTextContent('Token: stored-token-123');
    });
  });

  test('handles login action correctly (updates state and localStorage)', async () => {
    renderProvider();
    const user = userEvent.setup();
    await user.click(screen.getByText('Login'));
    expect(screen.getByTestId('user-display')).toHaveTextContent('User: TestUser');
    expect(screen.getByTestId('token-display')).toHaveTextContent('Token: fake-jwt-token');
    expect(window.localStorage.getItem('authToken')).toBe('fake-jwt-token');
    expect(JSON.parse(window.localStorage.getItem('authUser'))).toEqual({ username: 'TestUser' });
  });

  test('handles logout action correctly (clears state and localStorage)', async () => {
    window.localStorage.setItem('authUser', JSON.stringify({ username: 'OldUser' }));
    window.localStorage.setItem('authToken', 'old-token');

    renderProvider();
    const user = userEvent.setup();

    await waitFor(() => {
        expect(screen.getByTestId('user-display')).toHaveTextContent('User: OldUser');
    });

    await user.click(screen.getByText('Logout'));

    expect(screen.getByTestId('user-display')).toHaveTextContent('No User');
    expect(screen.getByTestId('token-display')).toHaveTextContent('No Token');
    expect(window.localStorage.getItem('authToken')).toBeNull();
    expect(window.localStorage.getItem('authUser')).toBeNull();
  });

  test('handles corrupted localStorage data gracefully', async () => {
    window.localStorage.setItem('authUser', '{ invalid-json }');
    window.localStorage.setItem('authToken', 'some-token');

    renderProvider();

    await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('user-display')).toHaveTextContent('No User');
    expect(window.localStorage.getItem('authUser')).toBeNull();
    expect(window.localStorage.getItem('authToken')).toBeNull();
  });
});