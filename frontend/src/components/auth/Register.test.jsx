import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Register from './Register';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mocks.navigate,
  };
});

describe('Register Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  const renderRegister = () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
  };

  test('displays the registration form correctly', () => {
    renderRegister();
    
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  test('allows the user to fill in the fields', async () => {
    renderRegister();
    const user = userEvent.setup();

    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(usernameInput, 'JaneDoe');
    await user.type(emailInput, 'jane@test.com');
    await user.type(passwordInput, 'secret123');
    
    expect(usernameInput).toHaveValue('JaneDoe');
    expect(emailInput).toHaveValue('jane@test.com');
    expect(passwordInput).toHaveValue('secret123');
  });

  test('manage register success', async () => {
    renderRegister();
    const user = userEvent.setup();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        message: 'User registered successfully',
      }),
    });

    await user.type(screen.getByLabelText(/username/i), 'JaneDoe');
    await user.type(screen.getByLabelText(/email/i), 'jane@test.com');
    await user.type(screen.getByLabelText(/password/i), 'secret123'); // > 8 chars
    
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/auth/register', expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ 
                username: 'JaneDoe', 
                email: 'jane@test.com', 
                password: 'secret123' 
            })
        }));
    });

    expect(mocks.navigate).toHaveBeenCalledWith('/login');
  });

  test('manage register failure', async () => {
    renderRegister();
    const user = userEvent.setup();

    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        message: 'Email already exists',
      }),
    });

    await user.type(screen.getByLabelText(/username/i), 'JaneDoe');
    await user.type(screen.getByLabelText(/email/i), 'exists@test.com');
    await user.type(screen.getByLabelText(/password/i), 'secret123');
    
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    const errorMessage = await screen.findByText('Email already exists');
    expect(errorMessage).toBeInTheDocument();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });
});