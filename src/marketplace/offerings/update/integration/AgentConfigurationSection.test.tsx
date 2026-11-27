import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useCurrentStateAndParams } from '@uirouter/react';
import { set } from 'es-toolkit/compat';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceProviderOfferingsRetrieve,
  marketplaceProviderOfferingsSiteAgentConfigRetrieve,
  marketplaceProviderOfferingsUpdateIntegration,
  marketplaceSiteAgentPluginsList,
} from 'waldur-js-client';

import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';

import { AgentConfigurationSection } from './AgentConfigurationSection';

// Each edit field hands its dialog the scope and a callback; keep the
// callback so a test can save a value the way the dialog does.
const editButtons = vi.hoisted(
  () =>
    ({}) as Record<
      string,
      {
        value: unknown;
        save(value): Promise<any>;
        fieldComponent: any;
        fieldProps: any;
      }
    >,
);

vi.mock('@/form/FieldEditButton', () => ({
  FieldEditButton: ({
    name,
    scope,
    callback,
    fieldComponent,
    fieldProps,
  }: any) => {
    editButtons[name] = {
      value: name
        .split('.')
        .reduce((value: any, key: string) => value?.[key], scope),
      save: (value) => callback(set({}, name, value)),
      fieldComponent,
      fieldProps,
    };
    return null;
  },
}));

const configuration = {
  order_processing_backend: 'slurm',
  membership_sync_backend: 'slurm',
  reporting_backend: 'slurm',
  backend_settings: { default_account: 'root' },
  event_settings: { stomp_enabled: true },
};

const siteAgentOffering = {
  uuid: 'offering-uuid',
  type: 'Marketplace.SiteAgent',
  agent_configuration: configuration,
} as any;

const openTab = (section: string) =>
  vi.mocked(useCurrentStateAndParams).mockReturnValue({
    state: { name: 'marketplace-offering-update' },
    params: { section },
  } as any);

const refetch = vi.fn();

const renderSection = (offering = siteAgentOffering) =>
  renderWithProviders(
    <AgentConfigurationSection offering={offering} refetch={refetch} />,
  );

const savedConfiguration = () =>
  vi.mocked(marketplaceProviderOfferingsUpdateIntegration).mock.calls[0][0].body
    .agent_configuration;

const catalog = [
  {
    name: 'slurm',
    roles: ['order_processing', 'membership_sync', 'reporting'],
    secret_settings: [],
    settings_schema: {
      properties: {
        default_account: {
          title: 'Default Account',
          description: 'The account new ones go under.',
          type: 'string',
        },
        customer_prefix: { title: 'Customer Prefix', type: 'string' },
        partition: {
          title: 'Partition',
          anyOf: [{ type: 'string' }, { type: 'null' }],
          default: 'batch',
        },
        enable_qos: { title: 'Enable QoS', type: 'boolean', default: true },
        log_level: { title: 'Log level', type: 'string' },
        ldap: {
          title: 'LDAP',
          anyOf: [{ $ref: '#/$defs/Ldap' }, { type: 'null' }],
        },
        api_token: { title: 'API token', type: 'string', secret: true },
      },
      required: ['default_account'],
    },
  },
  {
    name: 'azure',
    roles: ['order_processing', 'reporting'],
    secret_settings: ['client_secret'],
    settings_schema: {
      properties: {
        subscription_id: { title: 'Subscription Id', type: 'string' },
        tenant_id: { title: 'Tenant Id', type: 'string' },
        client_secret: { title: 'Client Secret', type: 'string' },
        default_account: { title: 'Default Account', type: 'string' },
        log_level: { title: 'Log level', type: 'string' },
        location: {
          title: 'Location',
          enum: ['westeurope', 'northeurope'],
        },
      },
      required: ['subscription_id', 'tenant_id', 'client_secret'],
    },
  },
  { name: 'base', roles: ['username_management'], settings_schema: null },
];

const settingField = (key: string) =>
  editButtons[`agent_configuration.backend_settings.${key}`];

// The catalogue is in once the Roles tab points base to the JSON tab.
const waitForCatalog = () =>
  screen.findAllByText(/^No settings in the plugin catalog/);

const tabNames = () => screen.getAllByRole('tab').map((tab) => tab.textContent);

describe('AgentConfigurationSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(editButtons).forEach((key) => delete editButtons[key]);
    openTab('agent-backends');
    vi.mocked(marketplaceProviderOfferingsRetrieve).mockResolvedValue({
      data: { agent_configuration: configuration },
    } as any);
    vi.mocked(marketplaceSiteAgentPluginsList).mockResolvedValue({
      data: [
        {
          name: 'slurm',
          roles: ['order_processing', 'membership_sync', 'reporting'],
        },
        { name: 'ldap', roles: ['username_management'] },
      ],
    } as any);
    vi.mocked(
      marketplaceProviderOfferingsSiteAgentConfigRetrieve,
    ).mockResolvedValue({
      data: {
        offering: { backend_type: 'slurm' },
        secrets: [
          {
            field: 'backend_settings.ldap.bind_password',
            backend: 'slurm',
            requirement: 'required_with_parent',
          },
        ],
        version: 'abc123',
      },
    } as any);
    vi.mocked(marketplaceProviderOfferingsUpdateIntegration).mockResolvedValue({
      data: undefined,
    } as any);
  });

  it('shows the roles first, where links to the former tabs land', () => {
    renderSection();
    expect(screen.getByText('Agent configuration')).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'Roles', selected: true }),
    ).toBeInTheDocument();
    ['order_processing', 'membership_sync', 'reporting'].forEach((role) =>
      expect(editButtons[`agent_configuration.${role}_backend`]).toBeDefined(),
    );
    // Username management is unset: the agent uses base.
    expect(screen.getByText('base (default)')).toBeInTheDocument();
  });

  it.each(['agent-order-processing', 'agent-backend-azure'])(
    'opens Roles for %s, a tab that is not there',
    async (tab) => {
      vi.mocked(marketplaceSiteAgentPluginsList).mockResolvedValue({
        data: catalog,
      } as any);
      openTab(tab);
      renderSection();
      await waitForCatalog();
      expect(
        screen.getByRole('tab', { name: 'Roles', selected: true }),
      ).toBeInTheDocument();
    },
  );

  describe('a tab per backend in use with settings', () => {
    beforeEach(() => {
      vi.mocked(marketplaceSiteAgentPluginsList).mockResolvedValue({
        data: catalog,
      } as any);
    });

    it('lists each backend once, in role order', async () => {
      renderSection({
        ...siteAgentOffering,
        agent_configuration: { ...configuration, reporting_backend: 'azure' },
      });
      await waitForCatalog();
      expect(tabNames().slice(0, 3)).toEqual(['Roles', 'slurm', 'azure']);
    });

    it('is for slurm alone while no role is set', async () => {
      renderSection({
        ...siteAgentOffering,
        agent_configuration: { event_settings: { stomp_enabled: true } },
      });
      await waitForCatalog();
      expect(tabNames().slice(0, 3)).toEqual(['Roles', 'slurm', 'Events']);
    });

    it('is not there for a backend without a schema', async () => {
      renderSection({
        ...siteAgentOffering,
        agent_configuration: {
          ...configuration,
          order_processing_backend: 'site-plugin',
          custom_backends: ['site-plugin'],
        },
      });
      // site-plugin and base: their settings are JSON.
      expect(await waitForCatalog()).toHaveLength(2);
      expect(tabNames()).not.toContain('site-plugin');
      expect(tabNames()).toContain('slurm');
    });

    it('leaves an off role without settings', async () => {
      renderSection({
        ...siteAgentOffering,
        agent_configuration: { order_processing_backend: 'slurm' },
      });
      await waitForCatalog();
      expect(screen.getAllByText('Off')).toHaveLength(2);
      expect(
        screen.queryByTestId('backend-settings-slurm'),
      ).not.toBeInTheDocument();
    });
  });

  it('moves custom backends and the combined editor to the JSON tab', () => {
    openTab('agent-backend-settings');
    renderSection();
    expect(
      screen.getByRole('tab', { name: 'Advanced (JSON)', selected: true }),
    ).toBeInTheDocument();
    expect(editButtons['agent_configuration.custom_backends']).toBeDefined();
    expect(editButtons['agent_configuration.roles_and_settings']).toBeDefined();
    expect(editButtons['agent_configuration.backend_settings']).toBeDefined();
  });

  describe('with no agent role set', () => {
    const withoutRoles = {
      ...siteAgentOffering,
      agent_configuration: { event_settings: { stomp_enabled: true } },
    };

    beforeEach(() => {
      vi.mocked(marketplaceProviderOfferingsRetrieve).mockResolvedValue({
        data: { agent_configuration: withoutRoles.agent_configuration },
      } as any);
    });

    it('shows and opens each role on the backend the agent runs', () => {
      renderSection(withoutRoles);
      expect(screen.getAllByText('slurm (default)')).toHaveLength(3);
      expect(
        editButtons['agent_configuration.order_processing_backend'].value,
      ).toBe('slurm');
      expect(
        editButtons['agent_configuration.username_management_backend'].value,
      ).toBe('base');
    });

    it('keeps the other roles on slurm when the first one is set', async () => {
      openTab('agent-roles');
      renderSection(withoutRoles);
      await editButtons['agent_configuration.reporting_backend'].save(
        'cscs-dwdi-compute',
      );
      expect(savedConfiguration()).toEqual({
        event_settings: { stomp_enabled: true },
        order_processing_backend: 'slurm',
        membership_sync_backend: 'slurm',
        reporting_backend: 'cscs-dwdi-compute',
      });
    });

    it('turns a role off and keeps the others on slurm', async () => {
      renderSection(withoutRoles);
      await editButtons['agent_configuration.reporting_backend'].save(null);
      expect(savedConfiguration()).toEqual({
        event_settings: { stomp_enabled: true },
        order_processing_backend: 'slurm',
        membership_sync_backend: 'slurm',
      });
    });

    it('sets no role when another setting is saved', async () => {
      openTab('agent-settings');
      renderSection(withoutRoles);
      await editButtons[
        'agent_configuration.agent_settings.resource_import_enabled'
      ].save(true);
      expect(savedConfiguration()).not.toHaveProperty(
        'order_processing_backend',
      );
    });
  });

  it('is not shown on an offering without a site agent', () => {
    const { container } = renderSection({
      ...siteAgentOffering,
      type: 'Marketplace.Basic',
    });
    expect(container).toBeEmptyDOMElement();
  });

  // The backend leaves the configuration out for anyone who may not see the
  // offering's secret options.
  it('is not shown when the configuration is not returned', () => {
    const { container } = renderSection({
      uuid: 'offering-uuid',
      type: 'Marketplace.SiteAgent',
    } as any);
    expect(container).toBeEmptyDOMElement();
  });

  it('sends the whole configuration with the changed setting', async () => {
    openTab('agent-settings');
    renderSection();
    await editButtons[
      'agent_configuration.agent_settings.resource_import_enabled'
    ].save(true);

    expect(marketplaceProviderOfferingsUpdateIntegration).toHaveBeenCalledWith({
      path: { uuid: 'offering-uuid' },
      body: {
        agent_configuration: {
          ...configuration,
          agent_settings: { resource_import_enabled: true },
        },
      },
    });
  });

  it('sends the membership sync choice as the switch the agent reads', async () => {
    openTab('agent-events');
    renderSection();
    const field =
      editButtons[
        'agent_configuration.event_settings.stomp_membership_sync_enabled'
      ];
    expect(field.value).toBe('follow');
    await field.save('off');

    expect(savedConfiguration().event_settings).toEqual({
      stomp_enabled: true,
      stomp_membership_sync_enabled: false,
    });
  });

  it('sends the backend settings typed into the editor', async () => {
    openTab('agent-backend-settings');
    renderSection();
    await editButtons['agent_configuration.backend_settings'].save(
      '{"default_account": "other"}',
    );

    expect(savedConfiguration()).toEqual({
      ...configuration,
      backend_settings: { default_account: 'other' },
    });
  });

  // Shown under the field in the dialog, naming the blocked setting, and not
  // as a notification too.
  it('says which setting a 403 blocked, under the field', async () => {
    openTab('agent-settings');
    vi.mocked(marketplaceProviderOfferingsUpdateIntegration).mockRejectedValue({
      status: 403,
      detail:
        'You do not have permission to change where the site agent connects or what it runs: agent_settings.preserve_unmanaged_backend_users.',
    });
    renderSection();
    const refusal = await editButtons[
      'agent_configuration.agent_settings.preserve_unmanaged_backend_users'
    ]
      .save(true)
      .catch((error) => error);

    expect(refusal.fieldError).toEqual([
      "This change needs the permission to change the offering's agent configuration. Ask an organization owner or staff.",
      'You do not have permission to change where the site agent connects or what it runs: agent_settings.preserve_unmanaged_backend_users.',
    ]);
    expect(useNotify().showError).not.toHaveBeenCalled();
    expect(useNotify().showErrorResponse).not.toHaveBeenCalled();
  });

  it('shows a 400 under the field only', async () => {
    openTab('agent-roles');
    vi.mocked(marketplaceProviderOfferingsUpdateIntegration).mockRejectedValue({
      status: 400,
      agent_configuration: {
        backend_settings: {
          target_api_url: ['waldur: This setting is required.'],
        },
      },
    });
    renderSection();
    const refusal = await editButtons['agent_configuration.reporting_backend']
      .save('waldur')
      .catch((error) => error);

    expect(refusal.fieldError).toEqual([
      'backend_settings.target_api_url (waldur): This setting is required.',
    ]);
    expect(refusal.fieldHint).toEqual([
      expect.stringMatching(
        /^Change the backends and their settings in one save/,
      ),
    ]);
    expect(useNotify().showErrorResponse).not.toHaveBeenCalled();
  });

  it('notifies of a failure it cannot show under the field', async () => {
    openTab('agent-roles');
    vi.mocked(marketplaceProviderOfferingsUpdateIntegration).mockRejectedValue({
      status: 500,
    });
    renderSection();
    await editButtons['agent_configuration.reporting_backend']
      .save('slurm')
      .catch(() => undefined);

    expect(useNotify().showErrorResponse).toHaveBeenCalled();
  });

  // A page left open must not undo what was saved elsewhere meanwhile.
  it('lays the change over the configuration as it is now', async () => {
    openTab('agent-settings');
    const current = { ...configuration, reporting_backend: 'waldur' };
    vi.mocked(marketplaceProviderOfferingsRetrieve).mockResolvedValue({
      data: { agent_configuration: current },
    } as any);
    renderSection();
    await editButtons[
      'agent_configuration.agent_settings.omit_anomalous_usage_components'
    ].save(true);

    expect(savedConfiguration()).toEqual({
      ...current,
      agent_settings: { omit_anomalous_usage_components: true },
    });
  });

  // A whole-object editor sends what the user built from the value they saw;
  // laid over a newer one it would undo that change.
  it('refuses a JSON block that changed since the dialog opened', async () => {
    openTab('agent-backend-settings');
    vi.mocked(marketplaceProviderOfferingsRetrieve).mockResolvedValue({
      data: {
        agent_configuration: {
          ...configuration,
          backend_settings: { default_account: 'changed-elsewhere' },
        },
      },
    } as any);
    renderSection();
    const refusal = await editButtons['agent_configuration.backend_settings']
      .save('{"default_account": "mine"}')
      .catch((error) => error);

    expect(refusal.fieldError).toEqual([
      'This changed since you opened it. Close and reopen to edit the current value.',
    ]);
    expect(
      marketplaceProviderOfferingsUpdateIntegration,
    ).not.toHaveBeenCalled();
    expect(refetch).toHaveBeenCalled();
  });

  it('refuses roles and settings together when a role changed meanwhile', async () => {
    openTab('agent-backend-settings');
    vi.mocked(marketplaceProviderOfferingsRetrieve).mockResolvedValue({
      data: {
        agent_configuration: { ...configuration, reporting_backend: 'waldur' },
      },
    } as any);
    renderSection();
    const refusal = await editButtons['agent_configuration.roles_and_settings']
      .save('{"order_processing_backend": "slurm"}')
      .catch((error) => error);

    expect(refusal.fieldError).toEqual([
      expect.stringMatching(/^This changed since you opened it/),
    ]);
    expect(
      marketplaceProviderOfferingsUpdateIntegration,
    ).not.toHaveBeenCalled();
  });

  it('refuses clearing the last role, under the field', async () => {
    openTab('agent-roles');
    const current = { reporting_backend: 'waldur' };
    vi.mocked(marketplaceProviderOfferingsRetrieve).mockResolvedValue({
      data: { agent_configuration: current },
    } as any);
    renderSection({ ...siteAgentOffering, agent_configuration: current });
    const refusal = await editButtons['agent_configuration.reporting_backend']
      .save(null)
      .catch((error) => error);

    expect(refusal.fieldError).toEqual([
      expect.stringMatching(/^This would leave no role set/),
    ]);
    expect(
      marketplaceProviderOfferingsUpdateIntegration,
    ).not.toHaveBeenCalled();
    expect(useNotify().showErrorResponse).not.toHaveBeenCalled();
  });

  it('saves roles and backend settings in one request', async () => {
    openTab('agent-backend-settings');
    renderSection();
    const field = editButtons['agent_configuration.roles_and_settings'];
    expect(field.value).toEqual({
      order_processing_backend: 'slurm',
      membership_sync_backend: 'slurm',
      reporting_backend: 'slurm',
      username_management_backend: '',
      backend_settings: { default_account: 'root' },
    });
    await field.save(
      JSON.stringify({
        order_processing_backend: 'ceph_s3',
        membership_sync_backend: 'ceph_s3',
        reporting_backend: 'ceph_s3',
        backend_settings: { api_url: 'https://s3.example.org' },
      }),
    );

    expect(savedConfiguration()).toEqual({
      order_processing_backend: 'ceph_s3',
      membership_sync_backend: 'ceph_s3',
      reporting_backend: 'ceph_s3',
      backend_settings: { api_url: 'https://s3.example.org' },
      event_settings: { stomp_enabled: true },
    });
  });

  describe('settings of the backends in use', () => {
    beforeEach(() => {
      vi.mocked(marketplaceSiteAgentPluginsList).mockResolvedValue({
        data: catalog,
      } as any);
    });

    it('says which roles a backend tab is used for', async () => {
      openTab('agent-backend-slurm');
      renderSection();
      expect(await screen.findByTestId('backend-used-for')).toHaveTextContent(
        /^Used for Order processing, Membership sync,? and Reporting$/,
      );
    });

    it('lists the settings in groups, required ones open and marked', async () => {
      openTab('agent-backend-slurm');
      renderSection();
      const required = await screen.findByTestId('settings-group-required');
      expect(required).toHaveTextContent('Required · 1 setting, 1 set');
      expect(required).toHaveTextContent('Default Account');
      expect(required).toHaveTextContent('The account new ones go under.');
      expect(required).toHaveTextContent('root');
      expect(settingField('default_account').fieldProps.required).toBe(true);
      // A JSON setting is grouped by meaning, not by how it is edited.
      expect(screen.getByTestId('settings-group-specific')).toHaveTextContent(
        'Specific to slurm · 4 settings, 0 set',
      );
      expect(screen.getByTestId('settings-group-common')).toHaveTextContent(
        'Common to all backends · 1 setting, 0 set',
      );
      expect(
        screen.queryByTestId('settings-group-blocks'),
      ).not.toBeInTheDocument();
      // Groups with nothing set are folded.
      expect(screen.queryByText('Partition')).not.toBeInTheDocument();
      await userEvent.click(
        screen.getByRole('button', { name: /^Specific to slurm/ }),
      );
      expect(screen.getByText('default: batch')).toBeInTheDocument();
      expect(screen.getByText('default: Yes')).toBeInTheDocument();
      expect(settingField('partition').fieldProps.required).toBe(false);
      // An unset setting's editor opens on its default.
      expect(settingField('partition').value).toBe('batch');
      expect(screen.queryByText('API token')).not.toBeInTheDocument();
    });

    it('opens a group one of whose settings is set', async () => {
      openTab('agent-backend-slurm');
      renderSection({
        ...siteAgentOffering,
        agent_configuration: {
          ...configuration,
          backend_settings: { default_account: 'root', log_level: 'debug' },
        },
      });
      expect(await screen.findByText('debug')).toBeInTheDocument();
      expect(screen.getByTestId('settings-group-common')).toHaveTextContent(
        '1 setting, 1 set',
      );
      expect(screen.queryByText('Partition')).not.toBeInTheDocument();
    });

    it('searches the settings of every group', async () => {
      openTab('agent-backend-slurm');
      renderSection();
      const search = await screen.findByPlaceholderText('Search settings');
      await userEvent.type(search, 'QOS');
      expect(screen.getByText('Enable QoS')).toBeInTheDocument();
      expect(screen.getByTestId('settings-group-specific')).toBeInTheDocument();
      expect(
        screen.queryByTestId('settings-group-required'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('settings-group-blocks'),
      ).not.toBeInTheDocument();
      await userEvent.clear(search);
      await userEvent.type(search, 'account new');
      expect(screen.getByText('Default Account')).toBeInTheDocument();
      await userEvent.clear(search);
      await userEvent.type(search, 'nothing like it');
      expect(screen.getByText('No settings match.')).toBeInTheDocument();
      // Cleared, the groups fold as they were.
      await userEvent.clear(search);
      expect(screen.getByText('Default Account')).toBeInTheDocument();
      expect(screen.queryByText('Enable QoS')).not.toBeInTheDocument();
    });

    it('never lists a secret', async () => {
      openTab('agent-backend-azure');
      renderSection({
        ...siteAgentOffering,
        agent_configuration: { ...configuration, reporting_backend: 'azure' },
      });
      const search = await screen.findByPlaceholderText('Search settings');
      await userEvent.type(search, 'secret');
      expect(screen.getByText('No settings match.')).toBeInTheDocument();
      await userEvent.clear(search);
      await userEvent.type(search, 'location');
      expect(screen.getByText('Location')).toBeInTheDocument();
    });

    it('shows a key two backends declare in each, with its one value', async () => {
      openTab('agent-backend-azure');
      renderSection({
        ...siteAgentOffering,
        agent_configuration: { ...configuration, reporting_backend: 'azure' },
      });
      expect(await screen.findByTestId('backend-used-for')).toHaveTextContent(
        'Used for Reporting',
      );
      const required = screen.getByTestId('settings-group-required');
      expect(required).toHaveTextContent('Subscription Id');
      expect(required).toHaveTextContent('Tenant Id');
      // Not required for azure, and set: its group is open, with slurm's value.
      expect(screen.getByTestId('settings-group-common')).toHaveTextContent(
        'Default Account',
      );
      expect(screen.getByText('root')).toBeInTheDocument();
    });

    it('sends the whole configuration with just that setting changed', async () => {
      openTab('agent-backend-slurm');
      renderSection();
      await userEvent.click(
        await screen.findByRole('button', { name: /^Specific to slurm/ }),
      );
      await settingField('customer_prefix').save('c_');

      expect(
        marketplaceProviderOfferingsUpdateIntegration,
      ).toHaveBeenCalledTimes(1);
      expect(savedConfiguration()).toEqual({
        ...configuration,
        backend_settings: { default_account: 'root', customer_prefix: 'c_' },
      });
    });

    it('keeps settings saved meanwhile when saving one', async () => {
      vi.mocked(marketplaceProviderOfferingsRetrieve).mockResolvedValue({
        data: {
          agent_configuration: {
            ...configuration,
            backend_settings: { default_account: 'root', partition: 'gpu' },
          },
        },
      } as any);
      openTab('agent-backend-slurm');
      renderSection();
      await screen.findByTestId('settings-group-required');
      await settingField('default_account').save('other');

      expect(savedConfiguration().backend_settings).toEqual({
        default_account: 'other',
        partition: 'gpu',
      });
    });

    it('shows a refused setting under its field', async () => {
      vi.mocked(
        marketplaceProviderOfferingsUpdateIntegration,
      ).mockRejectedValue({
        status: 400,
        agent_configuration: {
          backend_settings: {
            default_account: ['slurm: Too long.'],
          },
        },
      });
      openTab('agent-backend-slurm');
      renderSection();
      await screen.findByTestId('settings-group-required');
      const refusal = await settingField('default_account')
        .save('x'.repeat(100))
        .catch((error) => error);

      expect(refusal.fieldError).toEqual(['slurm: Too long.']);
    });

    describe('choosing a backend', () => {
      beforeEach(() => openTab('agent-roles'));

      const roleField = () =>
        editButtons['agent_configuration.reporting_backend'];

      it('asks for the required settings the backends in use lack', async () => {
        renderSection({
          ...siteAgentOffering,
          agent_configuration: { ...configuration, backend_settings: {} },
        });
        await waitForCatalog();
        // slurm stays on the other roles: its setting is needed as well.
        expect(
          roleField()
            .fieldProps.getMissingSettings('azure')
            .map((setting) => setting.key),
        ).toEqual(['default_account', 'subscription_id', 'tenant_id']);
      });

      it('does not ask for a setting the agent is already served', async () => {
        // With no role set, the generator serves slurm's default account
        // although it is not stored, and an update keeps it.
        vi.mocked(
          marketplaceProviderOfferingsSiteAgentConfigRetrieve,
        ).mockResolvedValue({
          data: {
            offering: {
              backend_type: 'slurm',
              backend_settings: { default_account: 'root' },
            },
            secrets: [],
            version: 'abc123',
          },
        } as any);
        renderSection({
          ...siteAgentOffering,
          agent_configuration: { ...configuration, backend_settings: {} },
        });
        await waitForCatalog();
        await waitFor(() =>
          expect(
            roleField()
              .fieldProps.getMissingSettings('azure')
              .map((setting) => setting.key),
          ).toEqual(['subscription_id', 'tenant_id']),
        );
      });

      it('names the backend a missing setting belongs to', async () => {
        vi.mocked(
          marketplaceProviderOfferingsSiteAgentConfigRetrieve,
        ).mockResolvedValue({
          data: {
            offering: { backend_type: 'slurm' },
            secrets: [],
            version: 'v',
          },
        } as any);
        renderSection({
          ...siteAgentOffering,
          agent_configuration: { ...configuration, backend_settings: {} },
        });
        await waitForCatalog();
        const { fieldComponent: Field, fieldProps } = roleField();
        renderWithProviders(
          <Field
            input={{
              value: { backend: 'azure', settings: {} },
              onChange: vi.fn(),
            }}
            meta={{}}
            {...fieldProps}
          />,
        );
        const block = screen.getByTestId('role-required-settings');
        expect(block).toHaveTextContent(/azure needs these settings/);
        expect(block).toHaveTextContent(
          /slurm, which the other roles keep using, needs these settings/,
        );
      });

      it('asks for its required settings not set yet, without secrets', async () => {
        renderSection();
        await waitForCatalog();
        const { fieldComponent: Field, fieldProps } = roleField();
        const onChange = vi.fn();
        expect(
          fieldProps.getMissingSettings('azure').map((setting) => setting.key),
        ).toEqual(['subscription_id', 'tenant_id']);
        // The current backend lacks nothing.
        expect(fieldProps.getMissingSettings('slurm')).toEqual([]);
        renderWithProviders(
          <Field
            input={{
              value: { backend: 'azure', settings: {} },
              onChange,
            }}
            meta={{}}
            {...fieldProps}
          />,
        );
        expect(screen.getByTestId('role-required-settings')).toHaveTextContent(
          /azure needs these settings/,
        );
        expect(screen.getAllByText('Subscription Id')).not.toHaveLength(0);
        expect(screen.queryByText('Client Secret')).not.toBeInTheDocument();
        await userEvent.type(screen.getByLabelText('Subscription Id'), 'x');
        expect(onChange).toHaveBeenCalledWith({
          backend: 'azure',
          settings: { subscription_id: 'x' },
        });
      });

      it('saves the role and its settings in one request', async () => {
        renderSection();
        await waitForCatalog();
        await roleField().save({
          backend: 'azure',
          settings: { subscription_id: 'sub', tenant_id: 'ten' },
        });

        expect(
          marketplaceProviderOfferingsUpdateIntegration,
        ).toHaveBeenCalledTimes(1);
        expect(savedConfiguration()).toEqual({
          ...configuration,
          reporting_backend: 'azure',
          backend_settings: {
            default_account: 'root',
            subscription_id: 'sub',
            tenant_id: 'ten',
          },
        });
      });

      it('refuses an empty required setting in the dialog, naming it', async () => {
        renderSection();
        await waitForCatalog();
        const { validate } = roleField().fieldProps;
        expect(
          validate({
            backend: 'azure',
            settings: { subscription_id: 'sub', tenant_id: '' },
          }),
        ).toBe('Enter the required settings: Tenant Id.');
        expect(
          validate({
            backend: 'azure',
            settings: { subscription_id: 'sub', tenant_id: 'ten' },
          }),
        ).toBeUndefined();
        // A backend picked as is, with nothing to ask for.
        expect(validate('slurm')).toBeUndefined();
        expect(
          marketplaceProviderOfferingsUpdateIntegration,
        ).not.toHaveBeenCalled();
      });
    });
  });

  // The agent then starts no STOMP consumer and syncs no memberships.
  it('warns of membership sync over STOMP with STOMP events off', () => {
    openTab('agent-events');
    renderSection({
      ...siteAgentOffering,
      agent_configuration: { ...configuration, event_settings: {} },
    });
    const { fieldComponent: Field, fieldProps } =
      editButtons[
        'agent_configuration.event_settings.stomp_membership_sync_enabled'
      ];
    renderWithProviders(
      <Field
        input={{ value: 'on', onChange: vi.fn() }}
        meta={{}}
        {...fieldProps}
      />,
    );
    expect(
      screen.getByText(/^With STOMP events off, the agent does not sync/),
    ).toBeInTheDocument();
  });

  it('opens an empty JSON block as an empty object', () => {
    openTab('agent-backend-settings');
    renderSection();
    expect(editButtons['agent_configuration.backend_components'].value).toEqual(
      {},
    );
  });

  it('lists the secret of an unset block apart from those needed', async () => {
    openTab('agent-loads');
    renderSection();
    expect(await screen.findByText('abc123')).toBeInTheDocument();
    expect(
      screen.getByText('The backends in use need no secrets.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Secrets needed only once their block is configured'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('backend_settings.ldap.bind_password'),
    ).toBeInTheDocument();
  });

  it('shows the secret of a configured block as needed', async () => {
    vi.mocked(
      marketplaceProviderOfferingsSiteAgentConfigRetrieve,
    ).mockResolvedValue({
      data: {
        offering: {
          backend_type: 'slurm',
          backend_settings: { ldap: { uri: 'ldap://ldap.example.com' } },
        },
        secrets: [
          {
            field: 'backend_settings.ldap.bind_password',
            backend: 'slurm',
            requirement: 'required_with_parent',
          },
        ],
        version: 'abc123',
      },
    } as any);
    openTab('agent-loads');
    renderSection();
    expect(await screen.findByText('abc123')).toBeInTheDocument();
    expect(
      screen.getByText('backend_settings.ldap.bind_password'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Required once its block is set'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('The backends in use need no secrets.'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Secrets needed only once their block is configured'),
    ).not.toBeInTheDocument();
  });
});
