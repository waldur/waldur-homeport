import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceProviderOfferingsAddEndpoint,
  marketplaceProviderOfferingsUpdateEndpoint,
  NestedEndpoint,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { EndpointFormDialog } from './EndpointFormDialog';

const offering = { uuid: 'offering_uuid' };

// Saved before URLs were validated: not a URL the current rules accept.
const legacyEndpoint = {
  uuid: 'endpoint_uuid',
  name: 'Login node',
  url: 'not a valid url',
} as NestedEndpoint;

const renderDialog = (endpoint?: NestedEndpoint) =>
  renderWithProviders(
    <EndpointFormDialog resolve={{ offering, endpoint, refetch: vi.fn() }} />,
  );

describe('EndpointFormDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(marketplaceProviderOfferingsAddEndpoint).mockResolvedValue(
      {} as any,
    );
    vi.mocked(marketplaceProviderOfferingsUpdateEndpoint).mockResolvedValue(
      {} as any,
    );
  });

  it('disables Save until a field changes', async () => {
    renderDialog(legacyEndpoint);
    expect(await screen.findByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('renames an endpoint whose stored URL is invalid, sending only the name', async () => {
    renderDialog(legacyEndpoint);
    const user = userEvent.setup();

    const name = await screen.findByLabelText(/Name/);
    await user.clear(name);
    await user.type(name, 'Portal');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(
        vi.mocked(marketplaceProviderOfferingsUpdateEndpoint),
      ).toHaveBeenCalledWith({
        path: { uuid: offering.uuid },
        body: { uuid: legacyEndpoint.uuid, name: 'Portal' },
      });
    });
  });

  it('validates the URL once it is changed', async () => {
    renderDialog(legacyEndpoint);
    const user = userEvent.setup();

    const url = await screen.findByLabelText(/URL/);
    await user.clear(url);
    await user.type(url, 'still not a url');

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('sends both fields when adding an endpoint', async () => {
    renderDialog();
    const user = userEvent.setup();

    await user.type(await screen.findByLabelText(/Name/), 'Portal');
    await user.type(screen.getByLabelText(/URL/), 'https://portal.example.com');
    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(
        vi.mocked(marketplaceProviderOfferingsAddEndpoint),
      ).toHaveBeenCalledWith({
        path: { uuid: offering.uuid },
        body: { name: 'Portal', url: 'https://portal.example.com' },
      });
    });
  });
});
