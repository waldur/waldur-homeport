import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UIRouter } from '@uirouter/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  callManagingOrganisationsList,
  proposalProtectedCallsAvailableComplianceChecklistsList,
  proposalProtectedCallsCreate,
  proposalProtectedCallsPartialUpdate,
} from 'waldur-js-client';

import { isFeatureVisible } from '@/features/connect';
import { isExperimentalUiComponentsVisible } from '@/marketplace/utils';
import { renderWithProviders } from '@/test/harness';
import { createTestRouter } from '@/test/router';
import { useCustomer } from '@/workspace/hooks';

import { CallFormDialog } from './CallFormDialog';

vi.mock('@/marketplace/utils', () => ({
  isExperimentalUiComponentsVisible: vi.fn(() => false),
}));

vi.mock('@/features/connect', () => ({
  isFeatureVisible: vi.fn(() => false),
}));

const fakeCustomer = { uuid: 'customer-uuid' };
const fakeManager = { url: 'manager-url', uuid: 'manager-uuid' };

const renderDialog = (props: any) => {
  const router = createTestRouter();

  renderWithProviders(
    <UIRouter router={router}>
      <CallFormDialog {...props} />
    </UIRouter>,
  );
};

describe('CallFormDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(vi.mocked(useCustomer)).mockReturnValue(fakeCustomer as any);
    vi.mocked(callManagingOrganisationsList).mockResolvedValue({
      data: [fakeManager],
    } as any);
    vi.mocked(
      proposalProtectedCallsAvailableComplianceChecklistsList,
    ).mockResolvedValue({ data: [] } as any);
  });

  it('renders create dialog correctly', async () => {
    renderDialog({ resolve: { refetch: vi.fn() } });
    expect(await screen.findByText('Create call')).toBeInTheDocument();
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
  });

  it('renders edit dialog correctly', async () => {
    const call = {
      uuid: 'call-uuid',
      name: 'Existing Call',
      description: 'desc',
    };
    renderDialog({ resolve: { call, refetch: vi.fn() } });
    expect(await screen.findByText('Edit Existing Call')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Call')).toBeInTheDocument();
    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument();
  });

  it('initializes manager field on create', async () => {
    const user = userEvent.setup();
    vi.mocked(proposalProtectedCallsCreate).mockResolvedValue({
      data: { uuid: 'new-uuid' },
    } as any);
    renderDialog({ resolve: { refetch: vi.fn() } });

    await screen.findByText('Create call');

    await user.type(screen.getByLabelText(/Name/i), 'New Call');

    const submitBtn = screen.getByRole('button', { name: /Create/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(proposalProtectedCallsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            name: 'New Call',
            manager: 'manager-url',
          }),
        }),
      );
    });
  });

  it('submits edit correctly', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    const call = {
      uuid: 'call-uuid',
      name: 'Existing Call',
      description: 'desc',
    };
    vi.mocked(proposalProtectedCallsPartialUpdate).mockResolvedValue({} as any);

    renderDialog({ resolve: { call, refetch } });

    await screen.findByText('Edit Existing Call');

    await user.clear(screen.getByLabelText(/Name/i));
    await user.type(screen.getByLabelText(/Name/i), 'Updated Call');

    const submitBtn = screen.getByRole('button', { name: /Edit/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(proposalProtectedCallsPartialUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'call-uuid' },
          body: expect.objectContaining({
            name: 'Updated Call',
          }),
        }),
      );
      expect(refetch).toHaveBeenCalled();
    });
  });

  it('handles API validation errors', async () => {
    const user = userEvent.setup();
    vi.mocked(proposalProtectedCallsCreate).mockRejectedValue({
      response: {
        status: 400,
        data: { name: 'Name already exists' },
      },
    } as any);

    renderDialog({ resolve: { refetch: vi.fn() } });

    await screen.findByText('Create call');
    await user.type(screen.getByLabelText(/Name/i), 'Duplicate Name');

    await user.click(screen.getByRole('button', { name: /Create/i }));

    expect(await screen.findByText('Name already exists')).toBeInTheDocument();
  });

  it('shows compliance checklist when experimental UI is enabled', async () => {
    vi.mocked(isExperimentalUiComponentsVisible).mockReturnValue(true);
    vi.mocked(
      proposalProtectedCallsAvailableComplianceChecklistsList,
    ).mockResolvedValue({
      data: [{ uuid: 'checklist-uuid', name: 'Test Checklist' }],
    } as any);

    renderDialog({ resolve: { refetch: vi.fn() } });

    expect(
      await screen.findByLabelText(/Compliance checklist/i),
    ).toBeInTheDocument();
  });

  it('shows external URL when feature is visible in edit mode', async () => {
    vi.mocked(isFeatureVisible).mockReturnValue(true);
    const call = {
      uuid: 'call-uuid',
      name: 'Existing Call',
      description: 'desc',
    };

    renderDialog({ resolve: { call, refetch: vi.fn() } });

    expect(await screen.findByLabelText(/External URL/i)).toBeInTheDocument();
  });
});
