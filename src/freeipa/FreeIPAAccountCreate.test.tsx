import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { freeipaProfilesCreate } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { renderWithProviders } from '@/test/harness';
import * as workspaceHooks from '@/workspace/hooks';

import { FreeIPAAccountCreate } from './FreeIPAAccountCreate';

ENV.plugins.WALDUR_CORE.FREEIPA_USERNAME_PREFIX = 'test_';

vi.mocked(workspaceHooks.useUser).mockReturnValue({
  username: 'testuser',
  uuid: 'test-uuid',
} as any);

describe('FreeIPAAccountCreate', () => {
  const mockOnProfileAdded = vi.fn();

  const renderComponent = () => {
    return renderWithProviders(
      <FreeIPAAccountCreate onProfileAdded={mockOnProfileAdded} />,
    );
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the form with username field', () => {
    renderComponent();

    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should initialize with fixed username', () => {
    renderComponent();

    const usernameInput = screen.getByDisplayValue('testuser');
    expect(usernameInput).toBeInTheDocument();
  });

  it('should show username prefix if configured', () => {
    renderComponent();

    expect(screen.getByText('test_')).toBeInTheDocument();
  });

  it('should show helper text as tooltip', () => {
    renderComponent();

    // After refactoring, help text is shown as a tooltip with question mark icon
    expect(screen.getByTestId('QuestionIcon')).toBeInTheDocument();
  });

  it('should validate required username field', async () => {
    renderComponent();

    const usernameInput = screen.getByLabelText(/Username/i);
    const submitButton = screen.getByRole('button');

    // Clear the input to test validation
    await userEvent.clear(usernameInput);
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Username is required.')).toBeInTheDocument();
    });
  });

  it('should validate username pattern', async () => {
    renderComponent();

    const usernameInput = screen.getByLabelText(/Username/i);
    const submitButton = screen.getByRole('button');

    // Test invalid username pattern
    await userEvent.clear(usernameInput);
    await userEvent.type(usernameInput, 'invalid@username');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/usernames can contain letters/i),
      ).toBeInTheDocument();
    });
  });

  it('should validate minimum username length', async () => {
    renderComponent();

    const usernameInput = screen.getByLabelText(/Username/i);
    const submitButton = screen.getByRole('button');

    // Test username too short
    await userEvent.clear(usernameInput);
    await userEvent.type(usernameInput, 'ab');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('Minimum username length is 3 characters.'),
      ).toBeInTheDocument();
    });
  });

  it('should validate maximum username length with prefix', async () => {
    renderComponent();

    const usernameInput = screen.getByLabelText(/Username/i);
    const submitButton = screen.getByRole('button');

    // Test username too long (32 - 5 prefix = 27 max, so 28 should fail)
    const longUsername = 'a'.repeat(28);
    await userEvent.clear(usernameInput);
    await userEvent.type(usernameInput, longUsername);
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          'Maximum username length with mandatory username prefix is 32 characters.',
        ),
      ).toBeInTheDocument();
    });
  });

  it('should successfully create a profile with valid data', async () => {
    vi.mocked(freeipaProfilesCreate).mockResolvedValue({
      data: { uuid: 'mock-profile-uuid' },
    } as any);

    renderComponent();

    const usernameInput = screen.getByLabelText(/Username/i);
    const submitButton = screen.getByRole('button');

    // Enter valid username
    await userEvent.clear(usernameInput);
    await userEvent.type(usernameInput, 'validuser');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(freeipaProfilesCreate).toHaveBeenCalledWith({
        body: { username: 'validuser' },
      });
      expect(mockOnProfileAdded).toHaveBeenCalled();
    });
  });

  it('should handle API errors during profile creation', async () => {
    const mockError = {
      data: { username: ['Username already exists'] },
    };
    vi.mocked(freeipaProfilesCreate).mockRejectedValue(mockError);

    renderComponent();

    const usernameInput = screen.getByLabelText(/Username/i);
    const submitButton = screen.getByRole('button');

    // Enter valid username
    await userEvent.clear(usernameInput);
    await userEvent.type(usernameInput, 'existinguser');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(freeipaProfilesCreate).toHaveBeenCalledWith({
        body: { username: 'existinguser' },
      });
      // The error would be handled by showError/showErrorResponse hooks
    });
  });
});
