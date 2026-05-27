import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { freeipaProfilesCreate } from 'waldur-js-client';

import * as config from '@/core/config';
import * as workspaceHooks from '@/workspace/hooks';

import { FreeIPAAccountCreate } from './FreeIPAAccountCreate';
vi.mock('@/workspace/hooks');

// Mock API calls and dependencies
vi.mock('waldur-js-client');
vi.mock('@/core/config');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('FreeIPAAccountCreate', () => {
  const mockOnProfileAdded = vi.fn();

  const renderComponent = () => {
    // Mock Redux store
    vi.mocked(workspaceHooks.useUser).mockReturnValue({
      username: 'testuser',
      uuid: 'test-uuid',
    } as any);
    return render(
      <QueryClientProvider client={queryClient}>
        <FreeIPAAccountCreate onProfileAdded={mockOnProfileAdded} />
      </QueryClientProvider>,
    );
  };

  beforeEach(() => {
    vi.mocked(config).ENV = {
      plugins: {
        WALDUR_CORE: {
          FREEIPA_USERNAME_PREFIX: 'test_',
        },
      },
    } as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the form with username field', () => {
    renderComponent();

    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
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
    const svg = document.querySelector('svg[viewBox="0 0 256 256"]');
    expect(svg).toBeInTheDocument();
  });

  it('should validate required username field', async () => {
    renderComponent();

    const usernameInput = screen.getByRole('textbox');
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

    const usernameInput = screen.getByRole('textbox');
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

    const usernameInput = screen.getByRole('textbox');
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

    const usernameInput = screen.getByRole('textbox');
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

    const usernameInput = screen.getByRole('textbox');
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

    const usernameInput = screen.getByRole('textbox');
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
