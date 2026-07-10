import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-final-form';
import { describe, expect, it, vi } from 'vitest';

import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';

import { EditFieldDialog } from './EditFieldDialog';
import { FieldEditButtonProps } from './FieldEditButton.types';

describe('EditFieldDialog', () => {
  const mockCallback = vi.fn().mockResolvedValue(null);

  beforeEach(() => {
    vi.mocked(useModal().closeDialog).mockClear();
  });

  const defaultProps: { resolve: FieldEditButtonProps } = {
    resolve: {
      scope: { name: 'initial value', roles: ['admin', 'manager'] },
      name: 'name',
      callback: mockCallback,
      title: 'Edit Name',
      description: 'Please enter a name',
      label: 'Name Label',
      fieldComponent: (props: any) => (
        <input
          {...props.input}
          data-testid="input-field"
          aria-label="Name Label"
        />
      ),
    },
  };

  it('renders title, description and correct field label', () => {
    renderWithProviders(<EditFieldDialog {...defaultProps} />);

    expect(screen.getByText('Edit Name')).toBeInTheDocument();
    expect(screen.getByText('Please enter a name')).toBeInTheDocument();
    expect(screen.getByLabelText('Name Label')).toBeInTheDocument();
    expect(screen.getByTestId('input-field')).toHaveValue('initial value');
  });

  it('submits updated value and calls closeDialog on success', async () => {
    const user = userEvent.setup();
    renderWithProviders(<EditFieldDialog {...defaultProps} />);

    const input = screen.getByTestId('input-field');
    await user.clear(input);
    await user.type(input, 'new value');

    const submitBtn = screen.getByRole('button', { name: /Confirm/i });
    expect(submitBtn).toBeEnabled();
    await user.click(submitBtn);

    expect(mockCallback).toHaveBeenCalledWith({ name: 'new value' });
    await waitFor(() => {
      expect(useModal().closeDialog).toHaveBeenCalled();
    });
  });

  it('registers arrayMutators (final-form-arrays) in the Form component', () => {
    const MockFieldWithMutators = (props: any) => {
      const form = useForm();
      return (
        <div>
          <span data-testid="mutator-push">
            {form.mutators?.push ? 'present' : 'absent'}
          </span>
          <span data-testid="mutator-remove">
            {form.mutators?.remove ? 'present' : 'absent'}
          </span>
          <input {...props.input} />
        </div>
      );
    };

    const arrayProps = {
      resolve: {
        ...defaultProps.resolve,
        name: 'roles',
        fieldComponent: MockFieldWithMutators,
      },
    };

    renderWithProviders(<EditFieldDialog {...arrayProps} />);

    expect(screen.getByTestId('mutator-push')).toHaveTextContent('present');
    expect(screen.getByTestId('mutator-remove')).toHaveTextContent('present');
  });
});
