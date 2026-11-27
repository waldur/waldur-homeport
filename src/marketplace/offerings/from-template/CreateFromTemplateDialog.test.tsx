import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from '@uirouter/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceCategoriesList,
  marketplaceOfferingTemplatesCreateOffering,
  marketplaceOfferingTemplatesList,
  marketplaceSiteAgentPluginsList,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { getSelectByLabel, openAndSelectOption } from '@/test/select';
import { useCustomer } from '@/workspace/hooks';

import { CreateFromTemplateDialog } from './CreateFromTemplateDialog';

const template = {
  uuid: 'template-uuid',
  name: 'SLURM',
  description: 'A SLURM cluster run by the site agent.',
  version: 2,
  offering_type: 'Marketplace.SiteAgent',
  configuration_findings: [],
  // Everyone who sees a template gets its roles; the rest of its agent
  // configuration is staff's only.
  document: {},
  agent_roles: {
    order_processing_backend: 'slurm',
    membership_sync_backend: 'slurm',
    reporting_backend: 'slurm',
    username_management_backend: 'base',
  },
  parameters: [
    {
      key: 'cluster_name',
      label: 'Cluster name',
      description: 'SLURM cluster_name.',
      type: 'string',
      required: true,
      default: null,
      paths: ['offering.backend_id'],
      pattern: '[a-z][a-z0-9_]*',
    },
    {
      key: 'username_generation_policy',
      label: 'How usernames are generated',
      description: '',
      type: 'string',
      required: true,
      default: 'anonymized',
      paths: ['plugin_options.username_generation_policy'],
      choices: ['anonymized', 'full_name'],
    },
  ],
} as any;

const dryRunResult = (findings = []) => ({
  dry_run: true,
  offering_uuid: null,
  offering_name: 'Alps',
  template_version: 2,
  parameters: {},
  warnings: [],
  findings,
  document: {
    components: [
      {
        type: 'cpu',
        name: 'CPU',
        billing_type: 'usage',
        measured_unit: 'k-Hours',
      },
    ],
    plans: [
      {
        name: 'Default',
        unit: 'month',
        components: [{ component_type: 'cpu', amount: 0, price: '0.5' }],
      },
    ],
  },
});

const azurePlugin = {
  name: 'azure',
  roles: ['order_processing', 'reporting'],
  secret_settings: ['client_secret'],
  settings_schema: {
    required: ['subscription_id', 'client_secret', 'region'],
    properties: {
      subscription_id: {
        title: 'Subscription ID',
        description: 'The Azure subscription resources are billed to.',
        anyOf: [{ type: 'string' }, { type: 'null' }],
      },
      client_secret: { title: 'Client secret', type: 'string' },
      region: {
        title: 'Region',
        enum: ['westeurope', 'northeurope'],
        default: 'westeurope',
      },
    },
  },
};

const next = (user) => user.click(screen.getByTestId('wizard-submit-btn'));

const renderDialog = () =>
  renderWithProviders(
    <CreateFromTemplateDialog resolve={{ fetch: vi.fn() }} />,
  );

// Through the template, the basics and the parameters to the roles step.
const fillUpToRoles = async (user, clusterName = 'alps') => {
  await user.click(await screen.findByText('SLURM'));
  await next(user);
  await user.type(await screen.findByTestId('template-offering-name'), 'Alps');
  await openAndSelectOption(user, 'Category', 'HPC');
  await next(user);
  await user.type(
    await screen.findByTestId('parameter-cluster_name'),
    clusterName,
  );
  await next(user);
  await screen.findByText('Order processing');
  // Each role opens on the template's backend, which every reader of the
  // template is shown.
  expect(getSelectByLabel('Username management')).toHaveTextContent('base');
};

describe('CreateFromTemplateDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCustomer).mockReturnValue({ uuid: 'customer-uuid' } as any);
    vi.mocked(marketplaceOfferingTemplatesList).mockResolvedValue({
      data: [template],
    } as any);
    vi.mocked(marketplaceCategoriesList).mockResolvedValue({
      data: [{ uuid: 'category-uuid', url: '/category/', title: 'HPC' }],
      response: { headers: new Headers({ 'x-result-count': '1' }) },
    } as any);
    vi.mocked(marketplaceSiteAgentPluginsList).mockResolvedValue({
      data: [
        {
          name: 'slurm',
          roles: ['order_processing', 'membership_sync', 'reporting'],
        },
        { name: 'base', roles: ['username_management'] },
        { name: 'cscs-dwdi-compute', roles: ['reporting'] },
        azurePlugin,
      ],
    } as any);
    vi.mocked(marketplaceOfferingTemplatesCreateOffering).mockImplementation(
      ({ body }) =>
        Promise.resolve({
          data: body.dry_run
            ? dryRunResult()
            : { ...dryRunResult(), dry_run: false, offering_uuid: 'new-uuid' },
        }) as any,
    );
  });

  it('lists the published site-agent templates', async () => {
    renderDialog();
    expect(
      await screen.findByText('A SLURM cluster run by the site agent.'),
    ).toBeInTheDocument();
    expect(marketplaceOfferingTemplatesList).toHaveBeenCalledWith({
      query: expect.objectContaining({
        is_published: true,
        offering_type: 'Marketplace.SiteAgent',
      }),
    });
  });

  it('keeps Next off until a value fits its parameter', async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.click(await screen.findByText('SLURM'));
    await next(user);
    await user.type(
      await screen.findByTestId('template-offering-name'),
      'Alps',
    );
    await openAndSelectOption(user, 'Category', 'HPC');
    await next(user);
    const cluster = await screen.findByTestId('parameter-cluster_name');
    await user.type(cluster, 'Alps-1');
    await user.tab();
    expect(
      await screen.findByText('Does not match the pattern [a-z][a-z0-9_]*.'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('wizard-submit-btn')).toBeDisabled();
    // The policy opens on its default.
    expect(screen.getByText('anonymized')).toBeInTheDocument();
  });

  it('creates the offering the dry run checked and opens its agent setup', async () => {
    const user = userEvent.setup();
    renderDialog();
    await fillUpToRoles(user);
    await next(user);
    expect(await screen.findByText('Plans and prices')).toBeInTheDocument();
    expect(
      screen.getByText('The checks found nothing to fix.'),
    ).toBeInTheDocument();
    // The summary names the values and the roles the template starts with.
    expect(screen.getByText('alps')).toBeInTheDocument();
    expect(screen.getByText(/Username management/)).toBeInTheDocument();
    expect(screen.getByText('base')).toBeInTheDocument();
    const dryRun = vi.mocked(marketplaceOfferingTemplatesCreateOffering).mock
      .calls[0][0];
    expect(dryRun.body).toEqual({
      customer: 'customer-uuid',
      category: 'category-uuid',
      name: 'Alps',
      parameters: {
        cluster_name: 'alps',
        username_generation_policy: 'anonymized',
      },
      dry_run: true,
    });

    await waitFor(() =>
      expect(screen.getByTestId('wizard-submit-btn')).toBeEnabled(),
    );
    await next(user);
    await waitFor(() =>
      expect(useRouter().stateService.go).toHaveBeenCalledWith(
        'marketplace-offering-update',
        {
          uuid: 'customer-uuid',
          offering_uuid: 'new-uuid',
          tab: 'agent-configuration',
        },
      ),
    );
    const create = vi.mocked(marketplaceOfferingTemplatesCreateOffering).mock
      .calls[1][0];
    expect(create.body.dry_run).toBe(false);
  });

  it('sends a changed role and keeps Create off while the check refuses it', async () => {
    vi.mocked(marketplaceOfferingTemplatesCreateOffering).mockRejectedValue({
      data: {
        agent_configuration: {
          backend_settings: {
            cscs_dwdi_api_url: ['cscs-dwdi-compute: This setting is required.'],
          },
        },
      },
    });
    const user = userEvent.setup();
    renderDialog();
    await fillUpToRoles(user);
    await openAndSelectOption(user, 'Reporting', 'cscs-dwdi-compute');
    await next(user);
    expect(
      await screen.findByText(
        'agent_configuration.backend_settings.cscs_dwdi_api_url (cscs-dwdi-compute): This setting is required.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByTestId('wizard-submit-btn')).toBeDisabled();
    const dryRun = vi.mocked(marketplaceOfferingTemplatesCreateOffering).mock
      .calls[0][0];
    expect(dryRun.body.agent_roles).toEqual({
      reporting_backend: 'cscs-dwdi-compute',
    });
  });

  it('keeps Create off while the rules find an error', async () => {
    vi.mocked(marketplaceOfferingTemplatesCreateOffering).mockResolvedValue({
      data: dryRunResult([
        {
          rule: 'slurm_component_tres',
          severity: 'error',
          field: 'components.0.type',
          message: 'storage is not a SLURM TRES.',
        },
      ]),
    } as any);
    const user = userEvent.setup();
    renderDialog();
    await fillUpToRoles(user);
    await next(user);
    expect(
      await screen.findByText('storage is not a SLURM TRES.'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('wizard-submit-btn')).toBeDisabled();
  });

  it('asks for the settings a chosen backend needs and sends them', async () => {
    const user = userEvent.setup();
    renderDialog();
    await fillUpToRoles(user);
    expect(screen.queryByTestId('backend-settings')).not.toBeInTheDocument();
    expect(screen.getByTestId('wizard-submit-btn')).toBeEnabled();

    await openAndSelectOption(user, 'Reporting', 'azure');
    const block = await screen.findByTestId('backend-settings');
    expect(block).toHaveTextContent('Settings the chosen backends need');
    expect(block).toHaveTextContent('azure');
    expect(block).toHaveTextContent('Subscription ID');
    expect(block).toHaveTextContent(
      'The Azure subscription resources are billed to.',
    );
    // A secret stays in the agent's own configuration file.
    expect(block).not.toHaveTextContent('Client secret');
    // The region opens on its default.
    expect(block).toHaveTextContent('westeurope');
    expect(screen.getByTestId('wizard-submit-btn')).toBeDisabled();

    await user.type(
      screen.getByTestId('backend-setting-subscription_id'),
      'sub-1',
    );
    await waitFor(() =>
      expect(screen.getByTestId('wizard-submit-btn')).toBeEnabled(),
    );
    await next(user);
    expect(await screen.findByText('Plans and prices')).toBeInTheDocument();
    expect(screen.getByText(/Subscription ID \(azure\)/)).toBeInTheDocument();
    expect(screen.getByText('sub-1')).toBeInTheDocument();
    const dryRun = vi.mocked(marketplaceOfferingTemplatesCreateOffering).mock
      .calls[0][0];
    expect((dryRun.body as any).backend_settings).toEqual({
      subscription_id: 'sub-1',
      region: 'westeurope',
    });
  });

  it('drops the settings of a backend no longer chosen', async () => {
    const user = userEvent.setup();
    renderDialog();
    await fillUpToRoles(user);
    await openAndSelectOption(user, 'Reporting', 'azure');
    await screen.findByTestId('backend-settings');
    await openAndSelectOption(user, 'Reporting', 'slurm');
    await waitFor(() =>
      expect(screen.queryByTestId('backend-settings')).not.toBeInTheDocument(),
    );
    await next(user);
    await screen.findByText('Plans and prices');
    const dryRun = vi.mocked(marketplaceOfferingTemplatesCreateOffering).mock
      .calls[0][0];
    expect((dryRun.body as any).backend_settings).toBeUndefined();
  });

  it('does not ask for a setting a template parameter fills', async () => {
    vi.mocked(marketplaceOfferingTemplatesList).mockResolvedValue({
      data: [
        {
          ...template,
          parameters: [
            ...template.parameters,
            {
              key: 'subscription',
              label: 'Subscription',
              description: '',
              type: 'string',
              required: false,
              default: 'sub-0',
              paths: ['agent_configuration.backend_settings.subscription_id'],
            },
          ],
        },
      ],
    } as any);
    const user = userEvent.setup();
    renderDialog();
    await fillUpToRoles(user);
    await openAndSelectOption(user, 'Reporting', 'azure');
    const block = await screen.findByTestId('backend-settings');
    expect(block).not.toHaveTextContent('Subscription ID');
    expect(block).toHaveTextContent('Region');
    expect(screen.getByTestId('wizard-submit-btn')).toBeEnabled();
  });
});
