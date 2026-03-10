import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AuthForm from '../AuthForm';

// Mock context
const login = vi.fn();
const register = vi.fn();

vi.mock('@/context/AuthContext', () => ({
    useAuth: () => ({ login, register }),
}));

describe('AuthForm (Login)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls login with email/password when submitting login', async () => {
        const user = userEvent.setup();
        render(<AuthForm />);

        await user.type(screen.getByTestId('auth-email'), 'test@example.com');
        await user.type(screen.getByTestId('auth-password'), 'Passw0rd!');

        await user.click(screen.getByTestId('auth-submit'));

        expect(login).toHaveBeenCalledTimes(1);
        expect(login).toHaveBeenCalledWith('test@example.com', 'Passw0rd!');
    });

    it('shows error when login fails', async () => {
        login.mockResolvedValueOnce(false);

        const user = userEvent.setup();
        render(<AuthForm />);

        await user.type(screen.getByTestId('auth-email'), 'test@example.com');
        await user.type(screen.getByTestId('auth-password'), 'wrong');

        await user.click(screen.getByTestId('auth-submit'));

        expect(await screen.findByText(/بيانات الدخول غير صحيحة/i)).toBeInTheDocument();
    });
});
