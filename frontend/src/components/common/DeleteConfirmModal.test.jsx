import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import DeleteConfirmModal from './DeleteConfirmModal';

describe('DeleteConfirmModal Component', () => {
    const defaultProps = {
        title: 'Delete Item',
        itemLabel: 'Project X',
        onConfirm: vi.fn(),
        onCancel: vi.fn(),
    };

    test('renders the modal with correct content', () => {
        render(<DeleteConfirmModal {...defaultProps} />);

        expect(screen.getByText('Delete Item')).toBeInTheDocument();
        expect(screen.getByText('Project X')).toBeInTheDocument();
        expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });

    test('calls onCancel when cancel button is clicked', async () => {
        render(<DeleteConfirmModal {...defaultProps} />);
        const user = userEvent.setup();

        await user.click(screen.getByRole('button', { name: /cancel/i }));

        expect(defaultProps.onCancel).toHaveBeenCalled();
    });

    test('calls onConfirm when delete button is clicked', async () => {
        render(<DeleteConfirmModal {...defaultProps} />);
        const user = userEvent.setup();

        await user.click(screen.getByRole('button', { name: /delete/i }));

        expect(defaultProps.onConfirm).toHaveBeenCalled();
    });

    test('displays error message when onConfirm fails', async () => {
        const onConfirmMock = vi.fn().mockRejectedValue(new Error('Network error'));
        render(<DeleteConfirmModal {...defaultProps} onConfirm={onConfirmMock} />);
        const user = userEvent.setup();

        await user.click(screen.getByRole('button', { name: /delete/i }));

        await waitFor(() => {
            expect(screen.getByText('Network error')).toBeInTheDocument();
        });
    });

    test('displays default error prefix when onConfirm fails without message', async () => {
        const onConfirmMock = vi.fn().mockRejectedValue({});
        render(
            <DeleteConfirmModal 
                {...defaultProps} 
                onConfirm={onConfirmMock} 
                errorPrefix="Custom error prefix"
            />
        );
        const user = userEvent.setup();

        await user.click(screen.getByRole('button', { name: /delete/i }));

        await waitFor(() => {
            expect(screen.getByText('Custom error prefix.')).toBeInTheDocument();
        });
    });
});