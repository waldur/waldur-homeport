import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceSiteAgentPluginsList } from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { AgentConfigurationImport, importAgentConfiguration } from './api';
import { ImportAgentConfigurationButton } from './ImportAgentConfigurationButton';
import { ImportAgentConfigurationDialog } from './ImportAgentConfigurationDialog';

vi.mock('./api', () => ({ importAgentConfiguration: vi.fn() }));

const OFFERING_UUID = 'offering-uuid';

const SINGLE_FILE = `offerings:
  - name: Cluster
    waldur_offering_uuid: offering-uuid
`;

const TWO_BLOCKS_FILE = `offerings:
  - name: Other
    waldur_offering_uuid: other-uuid
  - name: Cluster
    waldur_offering_uuid: offering-uuid
`;

const preview = (
  overrides: Partial<AgentConfigurationImport> = {},
): AgentConfigurationImport => ({
  offerings: [
    {
      index: 0,
      name: 'Cluster',
      waldur_offering_uuid: OFFERING_UUID,
      matches_offering: true,
    },
  ],
  selected_index: 0,
  agent_configuration: { reporting_backend: 'cscs-dwdi-compute' },
  current: {},
  changes: [
    { path: 'reporting_backend', current: null, imported: 'cscs-dwdi-compute' },
    {
      path: 'event_settings.stomp_enabled',
      current: false,
      imported: true,
    },
  ],
  dropped_secrets: ['backend_settings.cscs_dwdi_client_secret'],
  ignored: [{ path: 'waldur_api_token', reason: 'Bootstrap key' }],
  component_differences: [
    {
      component: 'cpu',
      field: 'unit_factor',
      offering: 1,
      imported: 60,
      applicable: true,
      reason: null,
    },
  ],
  policy: null,
  errors: {},
  unresolved: [],
  applied: false,
  ...overrides,
});

const ACTION_CHOICES = [
  { value: 'notify_organization_owners', label: 'Notify organization owners' },
  { value: 'block_submission', label: 'Block job submission' },
];

const chooseAction = async (user, field: string, action: string) => {
  await user.click(screen.getByRole('combobox', { name: field }));
  await user.click(await screen.findByText(action));
};

const badRequest = (body: Record<string, unknown>) => ({
  ...body,
  data: body,
  status: 400,
});

const refetch = vi.fn();

const renderDialog = () =>
  renderWithProviders(
    <ImportAgentConfigurationDialog
      resolve={{ offeringUuid: OFFERING_UUID, refetch }}
    />,
  );

const pasteConfiguration = async (user, text: string) => {
  await user.click(screen.getByLabelText('Or paste the configuration'));
  await user.paste(text);
};

const nextButton = () => screen.getByTestId('import-next-button');
const importButton = () => screen.getByTestId('import-button');

describe('ImportAgentConfigurationDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('runs a dry run of the pasted text on Next and shows the review', async () => {
    const user = userEvent.setup();
    vi.mocked(importAgentConfiguration).mockResolvedValue(preview());
    renderDialog();

    expect(nextButton()).toBeDisabled();
    await pasteConfiguration(user, SINGLE_FILE);
    await user.click(nextButton());

    expect(importAgentConfiguration).toHaveBeenCalledWith(OFFERING_UUID, {
      configuration: SINGLE_FILE,
      dry_run: true,
    });
    // One block: no offering step.
    expect(await screen.findByTestId('import-changes')).toBeInTheDocument();
    expect(screen.queryByText('Offering to import')).not.toBeInTheDocument();

    expect(screen.getByText('reporting_backend')).toBeInTheDocument();
    expect(screen.getByText('cscs-dwdi-compute')).toBeInTheDocument();
    expect(
      screen.getByText('event_settings.stomp_enabled'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('backend_settings.cscs_dwdi_client_secret'),
    ).toBeInTheDocument();
    expect(screen.getByText('waldur_api_token')).toBeInTheDocument();
    expect(screen.getByText('Bootstrap key')).toBeInTheDocument();
    expect(screen.getByText('unit_factor')).toBeInTheDocument();
    expect(screen.getByText('60')).toBeInTheDocument();
    expect(importButton()).toBeEnabled();
  });

  it('asks for the block when the file has several, and re-runs with its index', async () => {
    const user = userEvent.setup();
    vi.mocked(importAgentConfiguration)
      .mockResolvedValueOnce(
        preview({
          offerings: [
            {
              index: 0,
              name: 'Other',
              waldur_offering_uuid: 'other-uuid',
              matches_offering: false,
            },
            {
              index: 1,
              name: 'Cluster',
              waldur_offering_uuid: OFFERING_UUID,
              matches_offering: true,
            },
          ],
          selected_index: 1,
        }),
      )
      .mockResolvedValueOnce(preview({ selected_index: 0 }));
    renderDialog();

    await pasteConfiguration(user, TWO_BLOCKS_FILE);
    await user.click(nextButton());

    expect(await screen.findByText('Offering to import')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Cluster/ })).toBeChecked();
    expect(screen.getByTestId('matches-offering')).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: /Other/ }));
    await user.click(nextButton());

    expect(importAgentConfiguration).toHaveBeenLastCalledWith(OFFERING_UUID, {
      configuration: TWO_BLOCKS_FILE,
      dry_run: true,
      offering_index: 0,
    });
    expect(await screen.findByTestId('import-changes')).toBeInTheDocument();
  });

  it('shows the block step when the server asks which block to import', async () => {
    const user = userEvent.setup();
    vi.mocked(importAgentConfiguration).mockRejectedValueOnce(
      badRequest({
        offering_index: ['Choose one of the blocks: 0 (Other), 1 (Cluster).'],
      }),
    );
    renderDialog();

    await pasteConfiguration(user, TWO_BLOCKS_FILE);
    await user.click(nextButton());

    expect(
      await screen.findByText(
        'Choose one of the blocks: 0 (Other), 1 (Cluster).',
      ),
    ).toBeInTheDocument();
    // Read from the file: the block for this offering is preselected.
    expect(screen.getByRole('radio', { name: /Cluster/ })).toBeChecked();
  });

  it('lists the blocks the server sends with its request to choose one', async () => {
    const user = userEvent.setup();
    vi.mocked(importAgentConfiguration).mockRejectedValueOnce(
      badRequest({
        offering_index: ['Choose one of the blocks.'],
        offerings: [
          {
            index: 0,
            name: 'Server block A',
            waldur_offering_uuid: 'a-uuid',
            matches_offering: false,
          },
          {
            index: 1,
            name: 'Server block B',
            waldur_offering_uuid: 'b-uuid',
            matches_offering: false,
          },
        ],
      }),
    );
    renderDialog();

    await pasteConfiguration(user, TWO_BLOCKS_FILE);
    await user.click(nextButton());

    expect(
      await screen.findByRole('radio', { name: /Server block A/ }),
    ).toBeChecked();
    expect(
      screen.getByRole('radio', { name: /Server block B/ }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Cluster')).not.toBeInTheDocument();
  });

  it('shows the errors of a previewed configuration and offers no import', async () => {
    const user = userEvent.setup();
    vi.mocked(importAgentConfiguration).mockResolvedValue(
      preview({
        errors: {
          backend_settings: {
            cscs_dwdi_api_url: ['cscs-dwdi-compute: This setting is required.'],
          },
        },
      }),
    );
    renderDialog();

    await pasteConfiguration(user, SINGLE_FILE);
    await user.click(nextButton());

    expect(
      await screen.findByText(
        'backend_settings.cscs_dwdi_api_url (cscs-dwdi-compute): This setting is required.',
      ),
    ).toBeInTheDocument();
    // The preview is shown all the same.
    expect(screen.getByTestId('import-changes')).toBeInTheDocument();
    expect(importButton()).toBeDisabled();
  });

  it('asks for placeholder settings and checks again with their values', async () => {
    const user = userEvent.setup();
    const unresolved = [
      {
        path: 'backend_settings.cscs_dwdi_api_url',
        placeholder: 'dwdi_api_url',
      },
    ];
    vi.mocked(importAgentConfiguration)
      .mockResolvedValueOnce(
        preview({
          unresolved,
          errors: {
            backend_settings: {
              cscs_dwdi_api_url: ['This setting is required.'],
            },
          },
        }),
      )
      .mockResolvedValueOnce(preview({ unresolved }))
      .mockResolvedValueOnce(preview({ applied: true }));
    renderDialog();

    await pasteConfiguration(user, SINGLE_FILE);
    await user.click(nextButton());

    const input = await screen.findByLabelText(
      'backend_settings.cscs_dwdi_api_url',
    );
    expect(
      screen.getByText('In the file: ${dwdi_api_url}'),
    ).toBeInTheDocument();
    expect(importButton()).toBeDisabled();

    await user.type(input, 'https://dwdi.example.org');
    // Not checked with the value yet.
    expect(importButton()).toBeDisabled();

    await user.click(screen.getByTestId('import-check-again'));
    await waitFor(() =>
      expect(importAgentConfiguration).toHaveBeenLastCalledWith(OFFERING_UUID, {
        configuration: SINGLE_FILE,
        dry_run: true,
        offering_index: 0,
        values: {
          'backend_settings.cscs_dwdi_api_url': 'https://dwdi.example.org',
        },
      }),
    );
    await waitFor(() =>
      expect(
        screen.queryByText(
          'backend_settings.cscs_dwdi_api_url: This setting is required.',
        ),
      ).not.toBeInTheDocument(),
    );
    // The value is kept across the dry run.
    expect(
      screen.getByLabelText('backend_settings.cscs_dwdi_api_url'),
    ).toHaveValue('https://dwdi.example.org');
    expect(importButton()).toBeEnabled();

    await user.click(importButton());
    await waitFor(() =>
      expect(importAgentConfiguration).toHaveBeenLastCalledWith(OFFERING_UUID, {
        configuration: SINGLE_FILE,
        offering_index: 0,
        values: {
          'backend_settings.cscs_dwdi_api_url': 'https://dwdi.example.org',
        },
        dry_run: false,
      }),
    );
  });

  it('shows the errors of a refused import on the review step', async () => {
    const user = userEvent.setup();
    vi.mocked(importAgentConfiguration)
      .mockResolvedValueOnce(preview())
      .mockRejectedValueOnce(
        badRequest({
          agent_configuration: {
            backend_settings: { default_account: ['This field is required.'] },
          },
        }),
      );
    renderDialog();

    await pasteConfiguration(user, SINGLE_FILE);
    await user.click(nextButton());
    await user.click(await screen.findByTestId('import-button'));

    expect(
      await screen.findByText(
        'backend_settings.default_account: This field is required.',
      ),
    ).toBeInTheDocument();
    expect(importButton()).toBeDisabled();
    expect(useModal().closeDialog).not.toHaveBeenCalled();
  });

  it('lets components be updated by choice, and checks the choice before importing', async () => {
    const user = userEvent.setup();
    const differences = [
      {
        component: 'cpu',
        field: 'unit_factor',
        offering: 1,
        imported: 60,
        applicable: true,
        reason: null,
      },
      {
        component: 'gpu',
        field: 'measured_unit',
        offering: 'hours',
        imported: 'GPU-hours',
        applicable: false,
        reason: 'The offering has no component gpu.',
      },
    ];
    vi.mocked(importAgentConfiguration)
      .mockResolvedValueOnce(preview({ component_differences: differences }))
      .mockResolvedValueOnce(preview({ component_differences: differences }))
      .mockResolvedValueOnce(preview({ applied: true }));
    renderDialog();

    await pasteConfiguration(user, SINGLE_FILE);
    await user.click(nextButton());

    const cpu = await screen.findByRole('checkbox', {
      name: 'Update unit_factor of cpu',
    });
    const gpu = screen.getByRole('checkbox', {
      name: 'Update measured_unit of gpu',
    });
    expect(cpu).not.toBeChecked();
    expect(cpu).toBeEnabled();
    expect(gpu).toBeDisabled();
    // The reason is in the row, and in the tooltip.
    expect(screen.getByTestId('choice-reason')).toHaveTextContent(
      'The offering has no component gpu.',
    );
    await user.hover(screen.getByTestId('choice-disabled-reason'));
    expect(
      (await screen.findAllByText('The offering has no component gpu.')).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByText('Updating components affects existing resources'),
    ).toBeInTheDocument();
    expect(importButton()).toBeEnabled();

    await user.click(cpu);
    // The preview does not reflect the choice yet.
    expect(importButton()).toBeDisabled();

    await user.click(screen.getByTestId('import-check-again'));
    await waitFor(() =>
      expect(importAgentConfiguration).toHaveBeenLastCalledWith(OFFERING_UUID, {
        configuration: SINGLE_FILE,
        dry_run: true,
        offering_index: 0,
        apply_components: [{ component: 'cpu', field: 'unit_factor' }],
      }),
    );
    await waitFor(() => expect(importButton()).toBeEnabled());
    expect(screen.queryByTestId('import-stale')).not.toBeInTheDocument();

    await user.click(importButton());
    await waitFor(() =>
      expect(importAgentConfiguration).toHaveBeenLastCalledWith(OFFERING_UUID, {
        configuration: SINGLE_FILE,
        offering_index: 0,
        apply_components: [{ component: 'cpu', field: 'unit_factor' }],
        dry_run: false,
      }),
    );
  });

  it('asks for the actions of a policy the import creates', async () => {
    const user = userEvent.setup();
    const policy = {
      exists: false,
      changes: [
        { field: 'limit_type', current: null, imported: 'GrpTRESMins' },
      ],
      applicable: true,
      reason: null,
      action_choices: ACTION_CHOICES,
      needs_actions: true,
    };
    vi.mocked(importAgentConfiguration)
      .mockResolvedValueOnce(preview({ policy }))
      .mockResolvedValueOnce(
        preview({
          policy,
          errors: { policy: { actions: ['Choose at least one action.'] } },
        }),
      )
      .mockResolvedValueOnce(preview({ policy }))
      .mockResolvedValueOnce(preview({ applied: true }));
    renderDialog();

    await pasteConfiguration(user, SINGLE_FILE);
    await user.click(nextButton());

    expect(await screen.findByTestId('import-policy')).toBeInTheDocument();
    expect(screen.getByText('limit_type')).toBeInTheDocument();
    expect(screen.getByText('GrpTRESMins')).toBeInTheDocument();
    const create = screen.getByRole('checkbox', {
      name: 'Also create the periodic usage policy',
    });
    expect(create).not.toBeChecked();
    // Not asked for until the policy is to be created.
    expect(
      screen.queryByTestId('import-policy-actions'),
    ).not.toBeInTheDocument();

    await user.click(create);
    expect(
      screen.getByRole('combobox', { name: 'When the policy fires' }),
    ).toBeInTheDocument();
    expect(importButton()).toBeDisabled();

    await user.click(screen.getByTestId('import-check-again'));
    await waitFor(() =>
      expect(importAgentConfiguration).toHaveBeenLastCalledWith(OFFERING_UUID, {
        configuration: SINGLE_FILE,
        dry_run: true,
        offering_index: 0,
        apply_policy: true,
      }),
    );
    // The server's error is shown under the select.
    expect(
      await within(screen.getByTestId('import-policy-actions')).findByText(
        'Choose at least one action.',
      ),
    ).toBeInTheDocument();
    expect(importButton()).toBeDisabled();

    await chooseAction(user, 'When the policy fires', 'Block job submission');
    // Chosen, but not checked yet.
    expect(importButton()).toBeDisabled();

    await user.click(screen.getByTestId('import-check-again'));
    await waitFor(() =>
      expect(importAgentConfiguration).toHaveBeenLastCalledWith(OFFERING_UUID, {
        configuration: SINGLE_FILE,
        dry_run: true,
        offering_index: 0,
        apply_policy: true,
        policy_actions: ['block_submission'],
      }),
    );
    await waitFor(() => expect(importButton()).toBeEnabled());

    await user.click(importButton());
    await waitFor(() =>
      expect(importAgentConfiguration).toHaveBeenLastCalledWith(OFFERING_UUID, {
        configuration: SINGLE_FILE,
        offering_index: 0,
        apply_policy: true,
        policy_actions: ['block_submission'],
        dry_run: false,
      }),
    );
  });

  it('lets the actions of an existing policy be kept or changed', async () => {
    const user = userEvent.setup();
    const policy = {
      exists: true,
      changes: [
        { field: 'limit_type', current: 'GrpTRES', imported: 'GrpTRESMins' },
      ],
      applicable: true,
      reason: null,
      action_choices: ACTION_CHOICES,
      needs_actions: false,
    };
    vi.mocked(importAgentConfiguration).mockResolvedValue(preview({ policy }));
    renderDialog();

    await pasteConfiguration(user, SINGLE_FILE);
    await user.click(nextButton());

    await user.click(
      await screen.findByRole('checkbox', {
        name: 'Also update the periodic usage policy',
      }),
    );
    expect(
      screen.getByRole('combobox', { name: 'Change its actions' }),
    ).toBeInTheDocument();

    // Left empty, the policy keeps its actions: nothing to choose first.
    await user.click(screen.getByTestId('import-check-again'));
    await waitFor(() =>
      expect(importAgentConfiguration).toHaveBeenLastCalledWith(OFFERING_UUID, {
        configuration: SINGLE_FILE,
        dry_run: true,
        offering_index: 0,
        apply_policy: true,
      }),
    );
    await waitFor(() => expect(importButton()).toBeEnabled());

    await chooseAction(
      user,
      'Change its actions',
      'Notify organization owners',
    );
    expect(importButton()).toBeDisabled();
    await user.click(screen.getByTestId('import-check-again'));
    await waitFor(() =>
      expect(importAgentConfiguration).toHaveBeenLastCalledWith(OFFERING_UUID, {
        configuration: SINGLE_FILE,
        dry_run: true,
        offering_index: 0,
        apply_policy: true,
        policy_actions: ['notify_organization_owners'],
      }),
    );
  });

  it('offers no policy update the user may not make', async () => {
    const user = userEvent.setup();
    vi.mocked(importAgentConfiguration).mockResolvedValue(
      preview({
        policy: {
          exists: true,
          changes: [],
          applicable: false,
          reason: 'You may not change the offering policy.',
          action_choices: ACTION_CHOICES,
          needs_actions: false,
        },
      }),
    );
    renderDialog();

    await pasteConfiguration(user, SINGLE_FILE);
    await user.click(nextButton());

    expect(
      await screen.findByRole('checkbox', {
        name: 'Also update the periodic usage policy',
      }),
    ).toBeDisabled();
  });

  it("sends each placeholder value with its setting's type", async () => {
    const user = userEvent.setup();
    vi.mocked(marketplaceSiteAgentPluginsList).mockResolvedValue({
      data: [
        {
          name: 'slurm',
          roles: ['order_processing', 'membership_sync', 'reporting'],
          secret_settings: [],
          settings_schema: {
            properties: {
              enable_qos: { title: 'Enable QoS', type: 'boolean' },
              partition_limit: { title: 'Partition limit', type: 'integer' },
            },
          },
        },
      ],
    } as any);
    const unresolved = [
      'backend_settings.enable_qos',
      'backend_settings.partition_limit',
      'event_settings.stomp_ws_port',
      'agent_settings.resource_import_enabled',
      'backend_settings.ldap.uri',
      'backend_settings.extra',
    ].map((path) => ({ path, placeholder: path.split('.').pop() }));
    vi.mocked(importAgentConfiguration).mockResolvedValue(
      preview({
        unresolved,
        agent_configuration: { order_processing_backend: 'slurm' },
      }),
    );
    renderDialog();

    await pasteConfiguration(user, SINGLE_FILE);
    await user.click(nextButton());

    // A switch for a boolean, a number input for an integer, text otherwise.
    const qos = await screen.findByRole('checkbox', {
      name: 'backend_settings.enable_qos',
    });
    expect(
      screen.getByRole('checkbox', {
        name: 'agent_settings.resource_import_enabled',
      }),
    ).toBeInTheDocument();
    await user.click(qos);
    await user.type(
      screen.getByLabelText('backend_settings.partition_limit'),
      '5',
    );
    await user.type(
      screen.getByLabelText('event_settings.stomp_ws_port'),
      '61614',
    );
    await user.type(
      screen.getByLabelText('backend_settings.ldap.uri'),
      'ldap://ldap.example.org',
    );
    await user.click(screen.getByLabelText('backend_settings.extra'));
    await user.paste('{"a": 1}');

    await user.click(screen.getByTestId('import-check-again'));
    await waitFor(() =>
      expect(importAgentConfiguration).toHaveBeenLastCalledWith(
        OFFERING_UUID,
        expect.objectContaining({
          values: {
            'backend_settings.enable_qos': true,
            'backend_settings.partition_limit': 5,
            'event_settings.stomp_ws_port': 61614,
            // A switch left off is false.
            'agent_settings.resource_import_enabled': false,
            // Of unknown type: JSON when it is, else as typed.
            'backend_settings.ldap.uri': 'ldap://ldap.example.org',
            'backend_settings.extra': { a: 1 },
          },
        }),
      ),
    );
  });

  it('offers an enum placeholder as its options and sends the option with its type', async () => {
    const user = userEvent.setup();
    vi.mocked(marketplaceSiteAgentPluginsList).mockResolvedValue({
      data: [
        {
          name: 'slurm',
          roles: ['order_processing', 'membership_sync', 'reporting'],
          secret_settings: [],
          settings_schema: {
            properties: {
              gpu_slots: {
                title: 'GPU slots',
                type: 'integer',
                enum: [1, 2, 4],
              },
              qos_level: { title: 'QoS level', enum: ['low', 'high'] },
            },
          },
        },
      ],
    } as any);
    vi.mocked(importAgentConfiguration).mockResolvedValue(
      preview({
        unresolved: [
          { path: 'backend_settings.gpu_slots', placeholder: 'GPU_SLOTS' },
          { path: 'backend_settings.qos_level', placeholder: 'QOS' },
        ],
        agent_configuration: { order_processing_backend: 'slurm' },
      }),
    );
    renderDialog();

    await pasteConfiguration(user, SINGLE_FILE);
    await user.click(nextButton());

    const slots = await screen.findByRole('combobox', {
      name: 'backend_settings.gpu_slots',
    });
    expect(
      within(slots)
        .getAllByRole('option')
        .map((option) => option.textContent),
    ).toEqual(['Choose...', '1', '2', '4']);
    await user.selectOptions(slots, '2');
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'backend_settings.qos_level' }),
      'high',
    );

    await user.click(screen.getByTestId('import-check-again'));
    await waitFor(() =>
      expect(importAgentConfiguration).toHaveBeenLastCalledWith(
        OFFERING_UUID,
        expect.objectContaining({
          values: {
            // A number, as the schema's option is.
            'backend_settings.gpu_slots': 2,
            'backend_settings.qos_level': 'high',
          },
        }),
      ),
    );
  });

  it('refuses pasted text longer than the server takes', async () => {
    const user = userEvent.setup();
    renderDialog();
    await pasteConfiguration(user, 'x'.repeat(512 * 1024 + 1));
    expect(
      screen.getAllByText('The configuration must be smaller than 512 KiB.')
        .length,
    ).toBeGreaterThan(0);
    expect(nextButton()).toBeDisabled();
    expect(importAgentConfiguration).not.toHaveBeenCalled();
  });

  it('keeps the review tables in place while a value is typed', async () => {
    const user = userEvent.setup();
    vi.mocked(importAgentConfiguration).mockResolvedValue(
      preview({
        unresolved: [
          { path: 'backend_settings.api_url', placeholder: 'API_URL' },
        ],
      }),
    );
    renderDialog();

    await pasteConfiguration(user, SINGLE_FILE);
    await user.click(nextButton());

    const change = await screen.findByText('reporting_backend');
    const checkbox = screen.getByRole('checkbox', {
      name: 'Update unit_factor of cpu',
    });
    await user.type(
      screen.getByLabelText('backend_settings.api_url'),
      'https://api.example.org',
    );

    expect(screen.getByTestId('import-stale')).toBeInTheDocument();
    // The same elements: not redrawn under the user.
    expect(screen.getByText('reporting_backend')).toBe(change);
    expect(
      screen.getByRole('checkbox', { name: 'Update unit_factor of cpu' }),
    ).toBe(checkbox);
  });

  it('shows a setting set to empty text apart from an unset one', async () => {
    const user = userEvent.setup();
    vi.mocked(importAgentConfiguration).mockResolvedValue(
      preview({
        changes: [
          {
            path: 'backend_settings.allocation_prefix',
            current: null,
            imported: '',
          },
        ],
      }),
    );
    renderDialog();

    await pasteConfiguration(user, SINGLE_FILE);
    await user.click(nextButton());

    expect(await screen.findByText('""')).toBeInTheDocument();
  });

  it('shows a component the offering lacks once', async () => {
    const user = userEvent.setup();
    vi.mocked(importAgentConfiguration).mockResolvedValue(
      preview({
        component_differences: [
          {
            component: 'node',
            field: 'measured_unit',
            offering: null,
            imported: 'node-hours',
            applicable: false,
            reason: 'The offering has no component node.',
          },
          {
            component: 'node',
            field: 'unit_factor',
            offering: null,
            imported: 1,
            applicable: false,
            reason: 'The offering has no component node.',
          },
          {
            component: 'cpu',
            field: 'unit_factor',
            offering: 1,
            imported: 60,
            applicable: true,
            reason: null,
          },
        ],
        ignored: [
          {
            path: 'backend_components.node',
            reason: 'The offering has no component of this type.',
          },
          { path: 'timezone', reason: 'Not held by Waldur.' },
        ],
      }),
    );
    renderDialog();

    await pasteConfiguration(user, SINGLE_FILE);
    await user.click(nextButton());

    expect(await screen.findAllByTestId('missing-component')).toHaveLength(1);
    expect(
      screen.queryByRole('checkbox', { name: /of node/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: 'Update unit_factor of cpu' }),
    ).toBeInTheDocument();
    const ignored = screen.getByTestId('import-ignored');
    expect(within(ignored).getByText('timezone')).toBeInTheDocument();
    expect(
      within(ignored).queryByText('backend_components.node'),
    ).not.toBeInTheDocument();
  });

  it('shows a configuration error on the file step', async () => {
    const user = userEvent.setup();
    vi.mocked(importAgentConfiguration).mockRejectedValueOnce(
      badRequest({ configuration: ['The file has no offerings list.'] }),
    );
    renderDialog();

    await pasteConfiguration(user, 'foo: bar');
    await user.click(nextButton());

    expect(
      await screen.findByText('The file has no offerings list.'),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Or paste the configuration'),
    ).toBeInTheDocument();
    expect(useNotify().showErrorResponse).not.toHaveBeenCalled();
  });

  it('shows validation errors and offers no import', async () => {
    const user = userEvent.setup();
    vi.mocked(importAgentConfiguration).mockRejectedValueOnce(
      badRequest({
        agent_configuration: {
          backend_settings: { default_account: ['This field is required.'] },
        },
      }),
    );
    renderDialog();

    await pasteConfiguration(user, SINGLE_FILE);
    await user.click(nextButton());

    expect(
      await screen.findByText(
        'backend_settings.default_account: This field is required.',
      ),
    ).toBeInTheDocument();
    expect(importButton()).toBeDisabled();
  });

  it('offers no import when the file changes nothing', async () => {
    const user = userEvent.setup();
    vi.mocked(importAgentConfiguration).mockResolvedValue(
      preview({ changes: [] }),
    );
    renderDialog();

    await pasteConfiguration(user, SINGLE_FILE);
    await user.click(nextButton());

    expect(
      await screen.findByText(
        'The offering already has this configuration: there is nothing to import.',
      ),
    ).toBeInTheDocument();
    expect(importButton()).toBeDisabled();
  });

  it('applies with dry_run false and the selected block, then refetches', async () => {
    const user = userEvent.setup();
    vi.mocked(importAgentConfiguration)
      .mockResolvedValueOnce(preview({ selected_index: 0 }))
      .mockResolvedValueOnce(preview({ applied: true }));
    const { queryClient } = renderDialog();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');

    await pasteConfiguration(user, SINGLE_FILE);
    await user.click(nextButton());
    await user.click(await screen.findByTestId('import-button'));

    await waitFor(() =>
      expect(importAgentConfiguration).toHaveBeenLastCalledWith(OFFERING_UUID, {
        configuration: SINGLE_FILE,
        offering_index: 0,
        dry_run: false,
      }),
    );
    await waitFor(() => expect(refetch).toHaveBeenCalled());
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ['site-agent-config', OFFERING_UUID],
    });
    expect(useNotify().showSuccess).toHaveBeenCalledWith(
      'Agent configuration has been imported.',
    );
    expect(useModal().closeDialog).toHaveBeenCalled();
  });
});

describe('ImportAgentConfigurationButton', () => {
  const offering = { uuid: OFFERING_UUID, customer_uuid: 'customer-uuid' };

  it('is hidden from who may not change the integration', () => {
    vi.mocked(useUser).mockReturnValue({ permissions: [] } as any);
    renderWithProviders(<ImportAgentConfigurationButton offering={offering} />);
    expect(
      screen.queryByRole('button', { name: 'Import configuration' }),
    ).not.toBeInTheDocument();
  });

  it('opens the wizard for who may', async () => {
    vi.mocked(useUser).mockReturnValue({ is_staff: true } as any);
    renderWithProviders(<ImportAgentConfigurationButton offering={offering} />);
    await userEvent.click(
      screen.getByRole('button', { name: 'Import configuration' }),
    );
    expect(useModal().openDialog).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        resolve: expect.objectContaining({ offeringUuid: OFFERING_UUID }),
        // Escape and a click beside it do not throw the wizard away.
        keyboard: false,
        backdrop: 'static',
      }),
    );
  });
});
