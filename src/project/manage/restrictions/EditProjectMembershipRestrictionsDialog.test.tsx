import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { projectsPartialUpdate } from 'waldur-js-client';

import { EditProjectMembershipRestrictionsDialog } from './EditProjectMembershipRestrictionsDialog';

vi.mock('waldur-js-client');

const fakeProject = {
  uuid: 'project-uuid',
  name: 'Test Project',
  user_email_patterns: ['@example.com'],
};

const renderDialog = (field = 'user_email_patterns') => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const store = createStore((state) => state, {
    notifications: [],
  });
  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <EditProjectMembershipRestrictionsDialog
          resolve={{ project: fakeProject as any, field: field as any }}
        />
      </QueryClientProvider>
    </Provider>,
  );
};

describe('EditProjectMembershipRestrictionsDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with initial values from project', () => {
    renderDialog();
    expect(screen.getByText('Edit email patterns')).toBeInTheDocument();
    expect(screen.getByDisplayValue('@example.com')).toBeInTheDocument();
  });

  it('updates project membership restrictions on submit', async () => {
    const user = userEvent.setup();
    vi.mocked(projectsPartialUpdate).mockResolvedValue({ data: {} } as any);
    renderDialog();

    const input = screen.getByDisplayValue('@example.com');
    await user.clear(input);
    await user.type(input, '@gmail.com, @outlook.com');

    await user.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(projectsPartialUpdate).toHaveBeenCalledWith({
        path: { uuid: 'project-uuid' },
        body: {
          user_email_patterns: ['@gmail.com', '@outlook.com'],
        },
      });
    });
  });

  it('handles empty input correctly', async () => {
    const user = userEvent.setup();
    vi.mocked(projectsPartialUpdate).mockResolvedValue({ data: {} } as any);
    renderDialog();

    const input = screen.getByDisplayValue('@example.com');
    await user.clear(input);

    await user.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(projectsPartialUpdate).toHaveBeenCalledWith({
        path: { uuid: 'project-uuid' },
        body: {
          user_email_patterns: [],
        },
      });
    });
  });

  it('disables Save button if form is not dirty', () => {
    renderDialog();
    const saveButton = screen.getByText('Save');
    expect(saveButton).toBeDisabled();
  });
});
