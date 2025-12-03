import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import Login from './Login';

const mocks = vi.hoisted(() => {
  return {
    navigate: vi.fn(),
    login: vi.fn(),
    useAuth: vi.fn(),
  };
});

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mocks.navigate,
  };
});

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    login: mocks.login, 
  }),
}));

describe('Login Component', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    mocks.useAuth.mockReturnValue({
      login: mocks.login,
    });

    global.fetch = vi.fn();
  });

  const renderLogin = () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
  };

  test('display the login form', () => {
    renderLogin();
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  test('allows the user to type in the fields', async () => {
    renderLogin();
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  test('manage login success', async () => {
    renderLogin();
    const user = userEvent.setup();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { user: { id: 1, name: 'John' }, token: 'fake-token' },
      }),
    });

    await user.type(screen.getByLabelText(/email/i), 'john@test.com');
    await user.type(screen.getByLabelText(/password/i), '123456');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ email: 'john@test.com', password: '123456' })
        }));
    });

    expect(mocks.login).toHaveBeenCalledWith({ id: 1, name: 'John' }, 'fake-token');    
    expect(mocks.navigate).toHaveBeenCalledWith('/projects');
  });

  test('manage login failure', async () => {
    renderLogin();
    const user = userEvent.setup();

    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        message: 'Invalid credentials',
      }),
    });

    await user.type(screen.getByLabelText(/email/i), 'john@test.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpass');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    const errorMessage = await screen.findByText('Invalid credentials');
    expect(errorMessage).toBeInTheDocument();
    
    expect(mocks.login).not.toHaveBeenCalled();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });
});