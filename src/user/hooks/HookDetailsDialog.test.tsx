import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  hooksEmailCreate,
  hooksWebCreate,
  hooksWebPartialUpdate,
} from 'waldur-js-client';

import { useNotify } from '@waldur/store/hooks';

import { HookDetailsDialog } from './HookDetailsDialog';
import { HookResponse } from './types';
import { loadEventGroupsOptions } from './utils';

// Mock the required modules
vi.mock('waldur-js-client');
vi.mock('./utils');
vi.mock('@waldur/modal/actions', () => ({
  closeModalDialog: vi.fn(),
}));
vi.mock('@waldur/store/hooks', () => ({
  useNotify: vi.fn().mockReturnValue({
    showSuccess: vi.fn(),
    showErrorResponse: vi.fn(),
  }),
}));

const mockStore = configureStore([]);
const store = mockStore({});

const renderWithRedux = (ui) => {
  return render(<Provider store={store}>{ui}</Provider>);
};

const mockEventGroups = [
  {
    key: 'users',
    title: 'Users',
    help_text: 'User related events',
  },
  {
    key: 'resources',
    title: 'Resources',
    help_text: 'Resource related events',
  },
];

describe('HookDetailsDialog', () => {
  const mockRefetch = vi.fn();
  const mockShowSuccess = vi.fn();
  const mockShowError = vi.fn();
  const mockShowErrorResponse = vi.fn();

  beforeEach(() => {
    vi.mocked(loadEventGroupsOptions).mockResolvedValue(mockEventGroups);
    vi.mocked(useNotify).mockReturnValue({
      showSuccess: mockShowSuccess,
      showError: mockShowError,
      showErrorResponse: mockShowErrorResponse,
    });
    store.clearActions();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Create mode', () => {
    beforeEach(async () => {
      renderWithRedux(<HookDetailsDialog resolve={{ refetch: mockRefetch }} />);
      await waitFor(() => {
        expect(screen.getByText('Create notification')).toBeInTheDocument();
      });
    });

    it('should render create form with webhook type selected by default', () => {
      expect(screen.getByText('Webhook')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('should handle webhook creation', async () => {
      vi.mocked(hooksWebCreate).mockResolvedValue(null);

      await userEvent.type(
        screen.getByTestId('destination-url'),
        'https://example.com/webhook',
      );

      userEvent.click(screen.getByText('Users'));
      userEvent.click(screen.getByText('Create'));

      await waitFor(() => {
        expect(hooksWebCreate).toHaveBeenCalledWith({
          body: {
            destination_url: 'https://example.com/webhook',
            event_groups: ['users'],
          },
        });
        expect(mockShowSuccess).toHaveBeenCalledWith(
          'Notification has been created.',
        );
      });
    });

    it('should handle email hook creation', async () => {
      vi.mocked(hooksEmailCreate).mockResolvedValue(null);

      await userEvent.click(screen.getByText('Email'));
      await userEvent.type(
        screen.getByTestId('email-address'),
        'test@example.com',
      );

      userEvent.click(screen.getByText('Users'));
      userEvent.click(screen.getByText('Create'));

      await waitFor(() => {
        expect(hooksEmailCreate).toHaveBeenCalledWith({
          body: {
            email: 'test@example.com',
            event_groups: ['users'],
          },
        });
        expect(mockShowSuccess).toHaveBeenCalledWith(
          'Notification has been created.',
        );
      });
    });
  });

  describe('Update mode', () => {
    const mockHook: HookResponse = {
      uuid: 'test-uuid',
      hook_type: 'webhook',
      destination_url: 'https://example.com/webhook',
      is_active: true,
      event_groups: ['users'],
    };
    beforeEach(async () => {
      renderWithRedux(
        <HookDetailsDialog
          resolve={{ hook: mockHook, refetch: mockRefetch }}
        />,
      );
      await waitFor(() => {
        expect(screen.getByText('Update notification')).toBeInTheDocument();
      });
    });

    it('should render update form with existing hook data', async () => {
      await waitFor(() => {
        expect(screen.getByText('Update notification')).toBeInTheDocument();
        expect(screen.getByText('Webhook')).toBeInTheDocument();
        expect(
          screen.getByDisplayValue('https://example.com/webhook'),
        ).toBeInTheDocument();
      });
    });

    it('should handle hook update', async () => {
      vi.mocked(hooksWebPartialUpdate).mockResolvedValue(null);
      // Update URL
      const urlInput = screen.getByTestId('destination-url');
      await userEvent.clear(urlInput);
      await waitFor(async () => {
        await userEvent.clear(urlInput);
        expect(urlInput).toHaveValue('');
      });
      await userEvent.type(urlInput, 'https://new-example.com/webhook');

      // Update event groups
      const resourcesCheckbox = screen.getByLabelText('Resources');
      await userEvent.click(resourcesCheckbox);

      // Submit form
      const submitButton = screen.getByText('Update');
      await userEvent.click(submitButton);
      await waitFor(() => {
        expect(hooksWebPartialUpdate).toHaveBeenCalledWith({
          path: { uuid: 'test-uuid' },
          body: {
            destination_url: 'https://new-example.com/webhook',
            is_active: true,
            event_groups: ['users', 'resources'],
          },
        });
        expect(mockRefetch).toHaveBeenCalled();
      });
    });

    it('should handle update error', async () => {
      const error = new Error('Update failed');
      vi.mocked(hooksWebPartialUpdate).mockRejectedValue(error);

      // Submit form without changes
      const submitButton = screen.getByText('Update');
      await userEvent.click(submitButton);
      expect(mockShowErrorResponse).toHaveBeenCalledWith(
        error,
        'Unable to update notification.',
      );
    });
  });
});
