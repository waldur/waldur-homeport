import { screen } from '@testing-library/react';
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

  it('shows the backend of each role on a site-agent offering', () => {
    renderSection();
    expect(screen.getByText('Agent configuration')).toBeInTheDocument();
    expect(screen.getByText('Order processing')).toBeInTheDocument();
    expect(screen.getByText('Username management')).toBeInTheDocument();
    // Username management is unset: the agent uses base.
    expect(screen.getByText('base (default)')).toBeInTheDocument();
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
    openTab('agent-backends');
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
    openTab('agent-backends');
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
