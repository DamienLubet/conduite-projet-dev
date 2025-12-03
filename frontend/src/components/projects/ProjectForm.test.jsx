import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import ProjectForm from './ProjectForm';

describe('ProjectForm Component', () => {
    test('renders correctly in default mode', () => {
        render(<ProjectForm onSubmit={vi.fn()} />);
        
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.queryByLabelText(/description/i)).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
    });

    test('renders correctly in edit mode with initial values', () => {
        const initialValues = { name: 'Existing Project', description: 'Old Description' };
        render(
            <ProjectForm 
                onSubmit={vi.fn()} 
                initialValues={initialValues} 
                isEditMode={true} 
            />
        );
        
        expect(screen.getByLabelText(/name/i)).toHaveValue('Existing Project');
        expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/description/i)).toHaveValue('Old Description');
    });

    test('renders cancel and delete buttons when props are provided', () => {
        render(
            <ProjectForm 
                onSubmit={vi.fn()} 
                onCancel={vi.fn()} 
                onDelete={vi.fn()} 
            />
        );
        
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });

    test('shows validation error when submitting empty name', async () => {
        const mockSubmit = vi.fn();
        render(<ProjectForm onSubmit={mockSubmit} />);
        const user = userEvent.setup();
        
        await user.type(screen.getByLabelText(/name/i), ' ');
        await user.click(screen.getByRole('button', { name: /save/i }));
        
        expect(screen.getByText('Name is required')).toBeInTheDocument();
        expect(mockSubmit).not.toHaveBeenCalled();
    });

    test('calls onSubmit with correct data on successful submission', async () => {
        const mockSubmit = vi.fn();
        render(<ProjectForm onSubmit={mockSubmit} isEditMode={true} />);
        const user = userEvent.setup();
        
        await user.type(screen.getByLabelText(/name/i), 'New Project');
        await user.type(screen.getByLabelText(/description/i), 'New Description');
        await user.click(screen.getByRole('button', { name: /save/i }));
        
        expect(mockSubmit).toHaveBeenCalledWith({
            name: 'New Project',
            description: 'New Description'
        });
    });

    test('handles submission loading state', async () => {
        const mockSubmit = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
        render(<ProjectForm onSubmit={mockSubmit} />);
        const user = userEvent.setup();
        
        await user.type(screen.getByLabelText(/name/i), 'Test');
        await user.click(screen.getByRole('button', { name: /save/i }));
        
        expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
        expect(screen.getByLabelText(/name/i)).toBeDisabled();
        
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /save/i })).not.toBeDisabled();
        });
    });

    test('displays error message when submission fails', async () => {
        const mockSubmit = vi.fn().mockRejectedValue(new Error('API Error'));
        render(<ProjectForm onSubmit={mockSubmit} />);
        const user = userEvent.setup();
        
        await user.type(screen.getByLabelText(/name/i), 'Test');
        await user.click(screen.getByRole('button', { name: /save/i }));
        
        await waitFor(() => {
            expect(screen.getByText('API Error')).toBeInTheDocument();
        });
    });

    test('calls onCancel when cancel button is clicked', async () => {
        const mockCancel = vi.fn();
        render(<ProjectForm onSubmit={vi.fn()} onCancel={mockCancel} />);
        const user = userEvent.setup();
        
        await user.click(screen.getByRole('button', { name: /cancel/i }));
        
        expect(mockCancel).toHaveBeenCalled();
    });

    test('calls onDelete when delete button is clicked', async () => {
        const mockDelete = vi.fn();
        render(<ProjectForm onSubmit={vi.fn()} onDelete={mockDelete} />);
        const user = userEvent.setup();
        
        await user.click(screen.getByRole('button', { name: /delete/i }));
        
        expect(mockDelete).toHaveBeenCalled();
    });
});