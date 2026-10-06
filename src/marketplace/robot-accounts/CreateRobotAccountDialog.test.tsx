import { screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceProviderResourcesRetrieve,
  marketplaceProviderResourcesRobotAccountUsersList,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import {
  CreateRobotAccountDialog,
  isUsernameManagedByProvider,
} from './CreateRobotAccountDialog';
import { RobotAccountEditDialog } from './RobotAccountEditDialog';

vi.mock('@/modal/useManagedMutation', () => ({
  useManagedMutation: () => ({ mutateAsync: vi.fn() }),
}));

vi.mock('@/modal/ModalDialog', () => ({
  ModalDialog: ({ children }: any) => <div>{children}</div>,
}));

// Both dialogs end in ResourceActionDialog; keep the fields it is handed.
let renderedFields: any[] = [];
vi.mock('@/resource/actions/ResourceActionDialog', () => ({
  ResourceActionDialog: ({ formFields }: any) => {
    renderedFields = formFields;
    return <div data-testid="robot-account-form" />;
  },
}));

const field = (name: string) => renderedFields.find((f) => f.name === name);

// waldur-js-client is auto-mocked globally (test/mocks/modal.js).
const searchUsers = async (query: string) => {
  vi.mocked(
    marketplaceProviderResourcesRobotAccountUsersList,
  ).mockResolvedValue({ data: [] } as any);
  await field('users').loadOptions(query, [], { page: 1 });
  return vi.mocked(marketplaceProviderResourcesRobotAccountUsersList).mock
    .calls[0][0];
};

afterEach(() => {
  renderedFields = [];
  vi.clearAllMocks();
});

describe('isUsernameManagedByProvider', () => {
  it('locks the username when the provider policy is inherited', () => {
    expect(
      isUsernameManagedByProvider({
        offering_plugin_options: {},
        offering_account_settings: {
          username_generation_policy: { value: 'service_provider' },
        },
      }),
    ).toBe(true);
  });

  it('allows a username when the effective policy is not service provider', () => {
    expect(
      isUsernameManagedByProvider({
        offering_plugin_options: {
          username_generation_policy: 'service_provider',
        },
        offering_account_settings: {
          username_generation_policy: { value: 'anonymized' },
        },
      }),
    ).toBe(false);
  });

  it('falls back to the offering plugin option', () => {
    expect(
      isUsernameManagedByProvider({
        offering_plugin_options: {
          username_generation_policy: 'service_provider',
        },
      }),
    ).toBe(true);
  });
});

describe('CreateRobotAccountDialog', () => {
  const resource = {
    uuid: 'marketplace-resource-uuid',
    url: 'https://example.com/api/marketplace-resources/x/',
    name: 'Cluster',
    offering_plugin_options: {},
    offering_account_settings: {
      username_generation_policy: { value: 'service_provider' },
    },
  };

  it('loads users the robot account may link, for the resource it is created on', async () => {
    renderWithProviders(<CreateRobotAccountDialog resolve={{ resource }} />);

    expect(await searchUsers('alice@example.com')).toMatchObject({
      path: { uuid: 'marketplace-resource-uuid' },
      query: { user_keyword: 'alice@example.com' },
    });
  });

  it('offers the same users as responsible user', () => {
    renderWithProviders(<CreateRobotAccountDialog resolve={{ resource }} />);

    expect(field('responsible_user').loadOptions).toBe(
      field('users').loadOptions,
    );
  });

  it('locks the username from the resource account settings', () => {
    renderWithProviders(<CreateRobotAccountDialog resolve={{ resource }} />);

    expect(field('username').disabled).toBe(true);
  });
});

describe('RobotAccountEditDialog', () => {
  // A robot account row: its own uuid, the resource's under resource_uuid, and
  // no offering_account_settings.
  const robotAccount = {
    uuid: 'robot-account-uuid',
    resource_uuid: 'marketplace-resource-uuid',
    type: 'cicd',
    username: 'robot',
    users: [],
    keys: [],
    responsible_user: null,
    offering_plugin_options: {},
  };

  const renderEditDialog = (accountSettings) => {
    vi.mocked(marketplaceProviderResourcesRetrieve).mockResolvedValue({
      data: {
        offering_plugin_options: {},
        offering_account_settings: accountSettings,
      },
    } as any);
    renderWithProviders(
      <RobotAccountEditDialog
        resolve={{ resource: robotAccount, refetch: vi.fn() }}
      />,
    );
    return screen.findByTestId('robot-account-form');
  };

  it('loads users for the resource the account belongs to, not the account', async () => {
    await renderEditDialog({});

    expect(await searchUsers('bob')).toMatchObject({
      path: { uuid: 'marketplace-resource-uuid' },
      query: { user_keyword: 'bob' },
    });
  });

  it('locks the username when the provider policy is inherited', async () => {
    await renderEditDialog({
      username_generation_policy: { value: 'service_provider' },
    });

    expect(marketplaceProviderResourcesRetrieve).toHaveBeenCalledWith(
      expect.objectContaining({ path: { uuid: 'marketplace-resource-uuid' } }),
    );
    await waitFor(() => expect(field('username').disabled).toBe(true));
  });

  it('leaves the username editable for any other policy', async () => {
    await renderEditDialog({
      username_generation_policy: { value: 'anonymized' },
    });

    expect(field('username').disabled).toBe(false);
  });
});
