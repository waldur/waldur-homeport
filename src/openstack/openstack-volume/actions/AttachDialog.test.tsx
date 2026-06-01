import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  openstackInstancesList,
  openstackVolumesAttach,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { mockListResponse } from '@/test/utils';

import { AttachDialog } from './AttachDialog';

const renderDialog = (props: any) => {
  renderWithProviders(<AttachDialog {...props} />);
};

describe('AttachDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const resource = {
    uuid: 'volume-uuid',
    name: 'Volume 1',
  };

  it('renders correctly and submits valid data', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();

    vi.mocked(openstackInstancesList).mockResolvedValue(
      mockListResponse([
        {
          url: '/api/openstack-instances/instance-1/',
          name: 'Instance 1',
        },
      ]),
    );

    vi.mocked(openstackVolumesAttach).mockResolvedValue({} as any);

    renderDialog({
      resolve: {
        resource,
        refetch,
      },
    });

    expect(
      await screen.findByText('Attach OpenStack Volume to Instance'),
    ).toBeInTheDocument();

    expect(openstackInstancesList).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.objectContaining({
          attach_volume_uuid: 'volume-uuid',
        }),
      }),
    );

    // Select instance
    await user.click(screen.getByLabelText(/Instance/i));
    await user.click(await screen.findByText('Instance 1'));

    const submitBtn = screen.getByRole('button', { name: /Submit/i });
    expect(submitBtn).not.toBeDisabled();
    await user.click(submitBtn);

    await waitFor(() => {
      expect(openstackVolumesAttach).toHaveBeenCalledWith({
        path: { uuid: 'volume-uuid' },
        body: { instance: '/api/openstack-instances/instance-1/' },
      });
      expect(refetch).toHaveBeenCalled();
    });
  });
});
