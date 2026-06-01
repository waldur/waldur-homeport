import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceProviderOfferingsRetrieve,
  marketplaceSiteAgentIdentitiesCreate,
  marketplaceSiteAgentIdentitiesUpdate,
  marketplaceProviderOfferingsList,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { openAndSelectOption } from '@/test/select';
import { mockListResponse } from '@/test/utils';

import { AgentIdentityForm } from './AgentIdentityForm';

describe('AgentIdentityForm', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return renderWithProviders(
      <AgentIdentityForm
        resolve={{
          refetch: vi.fn(),
          ...props,
        }}
      />,
    );
  };

  it('renders create mode correctly', () => {
    renderComponent();

    expect(screen.getByText('Create agent identity')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();

    expect(screen.getByLabelText(/Name/i)).toHaveValue('');
    expect(screen.getByLabelText(/Version/i)).toHaveValue('');
    expect(screen.getByLabelText(/Config file path/i)).toHaveValue('');
    expect(screen.getByLabelText(/Config file content/i)).toHaveValue('');
  });

  it('renders edit mode correctly', async () => {
    const mockIdentity = {
      uuid: 'agent-uuid',
      name: 'Test Agent',
      offering: 'offering-uuid',
      version: '1.2.3',
      config_file_path: '/etc/agent.yaml',
      config_file_content: 'key: value',
    };

    vi.mocked(marketplaceProviderOfferingsRetrieve).mockResolvedValue({
      data: { uuid: 'offering-uuid', name: 'Slurm Offering' },
    } as any);

    renderComponent({ identity: mockIdentity });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Update' }),
      ).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/Name/i)).toHaveValue('Test Agent');
    expect(screen.getByLabelText(/Version/i)).toHaveValue('1.2.3');
    expect(screen.getByLabelText(/Config file path/i)).toHaveValue(
      '/etc/agent.yaml',
    );
    expect(screen.getByLabelText(/Config file content/i)).toHaveValue(
      'key: value',
    );

    expect(screen.getByText('Slurm Offering')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    renderComponent();

    const submitButton = screen.getByRole('button', { name: 'Create' });
    expect(submitButton).toBeDisabled();

    await user.type(screen.getByLabelText(/Name/i), 'New Agent');
    // Offering is still missing
    expect(submitButton).toBeDisabled();

    // Mock offerings list for the async select
    vi.mocked(marketplaceProviderOfferingsList).mockResolvedValue(
      mockListResponse([{ uuid: 'offering-uuid', name: 'Slurm Offering' }]),
    );

    await openAndSelectOption(user, 'Offering', 'Slurm Offering');

    expect(submitButton).not.toBeDisabled();
  });

  it('handles creation submission successfully', async () => {
    const mockRefetch = vi.fn();
    vi.mocked(marketplaceProviderOfferingsList).mockResolvedValue(
      mockListResponse([{ uuid: 'offering-uuid', name: 'Slurm Offering' }]),
    );
    vi.mocked(marketplaceSiteAgentIdentitiesCreate).mockResolvedValue({
      data: {},
    } as any);

    renderComponent({ refetch: mockRefetch });

    await user.type(screen.getByLabelText(/Name/i), 'New Agent');
    await user.type(screen.getByLabelText(/Version/i), '1.0.0');
    await openAndSelectOption(user, 'Offering', 'Slurm Offering');
    await user.type(
      screen.getByLabelText(/Config file path/i),
      '/path/to/config',
    );
    await user.type(screen.getByLabelText(/Config file content/i), 'content');

    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(marketplaceSiteAgentIdentitiesCreate).toHaveBeenCalledWith({
        body: {
          name: 'New Agent',
          offering: 'offering-uuid',
          version: '1.0.0',
          config_file_path: '/path/to/config',
          config_file_content: 'content',
        },
      });
    });

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('handles edit submission successfully', async () => {
    const mockRefetch = vi.fn();
    const mockIdentity = {
      uuid: 'agent-uuid',
      name: 'Test Agent',
      offering: 'offering-uuid',
    };

    vi.mocked(marketplaceProviderOfferingsRetrieve).mockResolvedValue({
      data: { uuid: 'offering-uuid', name: 'Slurm Offering' },
    } as any);
    vi.mocked(marketplaceSiteAgentIdentitiesUpdate).mockResolvedValue({
      data: {},
    } as any);

    renderComponent({ identity: mockIdentity, refetch: mockRefetch });

    await waitFor(() => {
      expect(screen.getByLabelText(/Name/i)).toHaveValue('Test Agent');
    });

    await user.clear(screen.getByLabelText(/Name/i));
    await user.type(screen.getByLabelText(/Name/i), 'Updated Agent');

    await user.click(screen.getByRole('button', { name: 'Update' }));

    await waitFor(() => {
      expect(marketplaceSiteAgentIdentitiesUpdate).toHaveBeenCalledWith({
        path: { uuid: 'agent-uuid' },
        body: {
          name: 'Updated Agent',
          offering: 'offering-uuid',
          version: null,
          config_file_path: null,
          config_file_content: null,
        },
      });
    });

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('handles submission error', async () => {
    vi.mocked(marketplaceProviderOfferingsList).mockResolvedValue(
      mockListResponse([{ uuid: 'offering-uuid', name: 'Slurm Offering' }]),
    );
    vi.mocked(marketplaceSiteAgentIdentitiesCreate).mockRejectedValue(
      new Error('API Error'),
    );

    renderComponent();

    await user.type(screen.getByLabelText(/Name/i), 'New Agent');
    await openAndSelectOption(user, 'Offering', 'Slurm Offering');

    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(marketplaceSiteAgentIdentitiesCreate).toHaveBeenCalled();
    });

    // The form should still be there and submit button enabled after failure
    expect(screen.getByRole('button', { name: 'Create' })).not.toBeDisabled();
  });
});
