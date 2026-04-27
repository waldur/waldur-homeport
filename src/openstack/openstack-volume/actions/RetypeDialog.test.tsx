import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { openstackVolumesRetype, OpenStackVolumeType } from 'waldur-js-client';
import { OpenStackVolume } from 'waldur-js-client';

import { useModal } from '@/modal/hooks';
import * as api from '@/openstack/api';
import { useNotify } from '@/store/hooks';

import { RetypeDialog } from './RetypeDialog';

vi.mock('waldur-js-client');
vi.mock('@/openstack/api');
vi.mock('@/store/hooks');
vi.mock('@/modal/hooks');

const apiMock = vi.mocked(api);

const resource = {
  uuid: 'volume_uuid',
  tenant_uuid: 'tenant_uuid',
  type_name: 'Fast SSD',
  type: 'ssd',
} as Partial<OpenStackVolume>;

const fakeVolumeTypes = [
  {
    name: 'prod',
    description: 'HPC production HDD',
    url: 'prod',
  },
  {
    name: 'scratch',
    description: 'IOPS intensive SSD',
    url: 'scratch',
  },
  {
    name: 'Fast SSD',
    url: 'ssd',
  },
] as unknown as OpenStackVolumeType[];

const renderDialog = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <RetypeDialog resolve={{ resource, refetch: vi.fn() }} />
    </QueryClientProvider>,
  );
};

describe('RetypeDialog', () => {
  const mockShowSuccess = vi.fn();
  const mockShowErrorResponse = vi.fn();
  const mockCloseDialog = vi.fn();

  beforeEach(() => {
    apiMock.loadVolumeTypes.mockResolvedValue([]);
    vi.mocked(useNotify).mockReturnValue({
      showSuccess: mockShowSuccess,
      showErrorResponse: mockShowErrorResponse,
    } as any);
    vi.mocked(useModal).mockReturnValue({
      closeDialog: mockCloseDialog,
    } as any);
  });

  it('renders current volume type label', async () => {
    renderDialog();
    await waitFor(() => {
      expect(screen.getByText('Current type:')).toBeInTheDocument();
      expect(screen.getByText('Fast SSD')).toBeInTheDocument();
    });
  });

  it('renders placeholder if there are no other volume types available', async () => {
    renderDialog();
    await waitFor(() => {
      expect(
        screen.getByText('There are no other volume types available.'),
      ).toBeInTheDocument();
    });
  });

  it('renders list of volume types excluding current volume type', async () => {
    apiMock.loadVolumeTypes.mockResolvedValue(fakeVolumeTypes);

    renderDialog();

    await waitFor(() => {
      expect(screen.getByText('Current type:')).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    await userEvent.click(select);

    await waitFor(() => {
      expect(screen.getByText('prod (HPC production HDD)')).toBeInTheDocument();
      expect(
        screen.getByText('scratch (IOPS intensive SSD)'),
      ).toBeInTheDocument();
      expect(within(select).queryByText('Fast SSD')).not.toBeInTheDocument();
    });
  });

  it('makes API request when form is submitted', async () => {
    apiMock.loadVolumeTypes.mockResolvedValue(fakeVolumeTypes);
    vi.mocked(openstackVolumesRetype).mockResolvedValue(null);

    renderDialog();

    await waitFor(() => {
      expect(screen.getByText('Current type:')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const select = screen.getByRole('combobox');
    await user.click(select);
    await user.click(screen.getByText('prod (HPC production HDD)'));

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    expect(vi.mocked(openstackVolumesRetype)).toHaveBeenCalledWith({
      path: { uuid: resource.uuid },
      body: {
        type: 'prod',
      },
    });
  });

  it('displays error message when API call fails', async () => {
    const error = new Error('Network error');
    apiMock.loadVolumeTypes.mockResolvedValue(fakeVolumeTypes);
    vi.mocked(openstackVolumesRetype).mockRejectedValue(error);

    renderDialog();

    await waitFor(() => {
      expect(screen.getByText('Current type:')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const select = screen.getByRole('combobox');
    await user.click(select);
    await user.click(screen.getByText('prod (HPC production HDD)'));

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    expect(mockShowErrorResponse).toHaveBeenCalledWith(
      error,
      'Unable to retype volume.',
    );
  });

  it('submit button is disabled when volume type is not selected', async () => {
    apiMock.loadVolumeTypes.mockResolvedValue(fakeVolumeTypes);
    renderDialog();

    await waitFor(() => {
      expect(screen.getByText('Current type:')).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    expect(submitButton).toBeDisabled();
  });
});
