import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { customersList, customersRetrieve } from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { hasPermission } from '@/permissions/hasPermission';
import { renderWithProviders } from '@/test/harness';
import * as workspaceHooks from '@/workspace/hooks';

import { CreateOfferingForProviderButton } from './CreateOfferingButton';

const openDialog = vi.fn();

vi.mock('@/permissions/hasPermission', () => ({
  hasPermission: vi.fn(),
}));

// May create offerings for the organization "provider" only.
const providerOwner = {
  uuid: 'user',
  is_staff: false,
  permissions: [
    { scope_type: 'customer', scope_uuid: 'provider', role_name: 'x' },
    { scope_type: 'customer', scope_uuid: 'other', role_name: 'y' },
  ],
} as any;

const provider = {
  uuid: 'provider',
  name: 'AI Platform Services',
  url: 'https://api/customers/provider/',
};

describe('CreateOfferingForProviderButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useModal).mockReturnValue({
      openDialog,
      closeDialog: vi.fn(),
    } as any);
    vi.mocked(hasPermission).mockImplementation(
      (_user, { customerId }: any) => customerId === 'provider',
    );
    // The user's service providers; "other" is one too, but the user's
    // role there may not create offerings.
    vi.mocked(customersList).mockResolvedValue({
      data: [
        provider,
        { uuid: 'other', name: 'Other', url: 'https://api/customers/other/' },
      ],
    } as any);
    vi.mocked(customersRetrieve).mockResolvedValue({
      data: { ...provider, is_service_provider: true },
    } as any);
  });

  it('is hidden from who may create offerings for no organization', () => {
    vi.mocked(hasPermission).mockReturnValue(false);
    vi.mocked(workspaceHooks.useUser).mockReturnValue(providerOwner);
    renderWithProviders(<CreateOfferingForProviderButton />);
    expect(
      screen.queryByTestId('catalog-offering-add-btn'),
    ).not.toBeInTheDocument();
    expect(customersList).not.toHaveBeenCalled();
  });

  it('is hidden from the owner of an organization that is no service provider', async () => {
    vi.mocked(customersList).mockResolvedValue({ data: [] } as any);
    vi.mocked(workspaceHooks.useUser).mockReturnValue(providerOwner);
    renderWithProviders(<CreateOfferingForProviderButton />);
    await waitFor(() => expect(customersList).toHaveBeenCalled());
    expect(vi.mocked(customersList).mock.calls[0][0].query).toMatchObject({
      user_uuid: 'user',
      is_service_provider: true,
    });
    expect(
      screen.queryByTestId('catalog-offering-add-btn'),
    ).not.toBeInTheDocument();
  });

  it("offers only the user's providers, opening on the page's organization", async () => {
    vi.mocked(workspaceHooks.useUser).mockReturnValue(providerOwner);
    renderWithProviders(
      <CreateOfferingForProviderButton providerUuid="provider" />,
    );
    await userEvent.click(
      await screen.findByTestId('catalog-offering-add-btn'),
    );
    const { resolve } = openDialog.mock.calls[0][1];
    expect(resolve.showProvider).toBe(true);
    expect(resolve.providers).toEqual([provider]);
    expect(resolve.initialProvider).toEqual(provider);
    expect(customersRetrieve).not.toHaveBeenCalled();
  });

  it('does not open on an organization the user may not create for', async () => {
    vi.mocked(workspaceHooks.useUser).mockReturnValue(providerOwner);
    renderWithProviders(
      <CreateOfferingForProviderButton providerUuid="other" />,
    );
    await userEvent.click(
      await screen.findByTestId('catalog-offering-add-btn'),
    );
    const { resolve } = openDialog.mock.calls[0][1];
    expect(resolve.initialProvider).toBeUndefined();
  });

  it('offers staff every provider', async () => {
    vi.mocked(workspaceHooks.useUser).mockReturnValue({
      uuid: 'staff',
      is_staff: true,
      permissions: [],
    } as any);
    renderWithProviders(
      <CreateOfferingForProviderButton providerUuid="provider" />,
    );
    await waitFor(() => expect(customersRetrieve).toHaveBeenCalled());
    await userEvent.click(screen.getByTestId('catalog-offering-add-btn'));
    const { resolve } = openDialog.mock.calls[0][1];
    expect(resolve.providers).toBeUndefined();
    expect(resolve.initialProvider).toEqual(provider);
    expect(customersList).not.toHaveBeenCalled();
  });
});
