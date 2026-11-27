import { describe, expect, it } from 'vitest';

import {
  checkBackendSetting,
  getAskedBackendSettings,
  getBackendSettingValues,
} from './backendSettings';
import { buildCreateRequest } from './utils';

const azure = {
  name: 'azure',
  package: 'waldur-site-agent-azure',
  version: '1.0',
  roles: ['order_processing', 'reporting'],
  component_schema: null,
  secret_settings: ['client_secret'],
  settings_schema: {
    type: 'object',
    required: [
      'subscription_id',
      'tenant_id',
      'client_secret',
      'api_token',
      'region',
      'max_vms',
      'dry',
      'tags',
    ],
    properties: {
      subscription_id: { title: 'Subscription ID', type: 'string' },
      tenant_id: {
        title: 'Tenant ID',
        description: 'Directory of the subscription.',
        anyOf: [{ type: 'string' }, { type: 'null' }],
      },
      client_secret: { title: 'Client secret', type: 'string' },
      api_token: { title: 'API token', type: 'string', secret: true },
      region: { $ref: '#/$defs/Region', default: 'westeurope' },
      max_vms: { title: 'Max VMs', type: 'integer' },
      dry: { title: 'Dry', type: 'boolean' },
      // An object cannot be entered as one field: left to the dry run.
      tags: { title: 'Tags', type: 'object' },
      location: { title: 'Location', type: 'string' },
    },
    $defs: {
      Region: { title: 'Region', enum: ['westeurope', 'northeurope'] },
    },
  },
} as any;

const slurm = {
  name: 'slurm',
  roles: ['order_processing', 'membership_sync', 'reporting'],
  secret_settings: [],
  settings_schema: {
    required: ['default_account', 'tenant_id'],
    properties: {
      default_account: { title: 'Default account', type: 'string' },
      tenant_id: { title: 'Tenant', type: 'string' },
    },
  },
} as any;

const template = (overrides = {}) =>
  ({ document: {}, parameters: [], ...overrides }) as any;

const keys = (asked) =>
  asked.map(({ backend, settings }) => [
    backend,
    settings.map((setting) => setting.key),
  ]);

describe('getAskedBackendSettings', () => {
  it('asks for the required, non-secret settings of the chosen backends', () => {
    const asked = getAskedBackendSettings(
      [azure, slurm],
      { order_processing_backend: 'azure', reporting_backend: '' },
      template(),
    );
    expect(keys(asked)).toEqual([
      ['azure', ['subscription_id', 'tenant_id', 'region', 'max_vms', 'dry']],
    ]);
    const settings = asked[0].settings;
    expect(settings[1]).toMatchObject({
      title: 'Tenant ID',
      description: 'Directory of the subscription.',
      kind: 'string',
    });
    expect(settings[2]).toMatchObject({
      kind: 'string',
      choices: ['westeurope', 'northeurope'],
      default: 'westeurope',
    });
    expect(settings[3].kind).toBe('integer');
    expect(settings[4].kind).toBe('boolean');
  });

  it('asks for a setting two backends share once, under the first', () => {
    const asked = getAskedBackendSettings(
      [azure, slurm],
      { order_processing_backend: 'azure', reporting_backend: 'slurm' },
      template(),
    );
    expect(keys(asked)[1]).toEqual(['slurm', ['default_account']]);
  });

  it('leaves out what the template sets or fills from a parameter', () => {
    const asked = getAskedBackendSettings(
      [azure],
      { order_processing_backend: 'azure' },
      template({
        document: {
          agent_configuration: { backend_settings: { max_vms: 4 } },
        },
        parameters: [
          {
            key: 'subscription',
            paths: ['agent_configuration.backend_settings.subscription_id'],
          },
        ],
      }),
    );
    expect(keys(asked)).toEqual([['azure', ['tenant_id', 'region', 'dry']]]);
  });

  it("asks nothing for a backend the template's roles run", () => {
    const slurmTemplate = template({
      agent_roles: {
        order_processing_backend: 'slurm',
        membership_sync_backend: 'slurm',
        reporting_backend: 'slurm',
        username_management_backend: 'base',
      },
    });
    // Reporting switched to azure: azure is asked for, slurm is not, nor
    // a setting slurm requires, which the template already holds.
    expect(
      keys(
        getAskedBackendSettings(
          [azure, slurm],
          {
            order_processing_backend: 'slurm',
            membership_sync_backend: 'slurm',
            reporting_backend: 'azure',
          },
          slurmTemplate,
        ),
      ),
    ).toEqual([['azure', ['subscription_id', 'region', 'max_vms', 'dry']]]);
    // slurm on another role than the template's is still the template's.
    expect(
      getAskedBackendSettings(
        [azure, slurm],
        { order_processing_backend: 'slurm', reporting_backend: '' },
        template({ agent_roles: { reporting_backend: 'slurm' } }),
      ),
    ).toEqual([]);
  });

  it('asks for nothing of a custom backend outside the catalogue', () => {
    expect(
      getAskedBackendSettings(
        [azure],
        { order_processing_backend: 'mine' },
        template(),
      ),
    ).toEqual([]);
  });
});

describe('backend setting values', () => {
  const asked = getAskedBackendSettings(
    [azure],
    { order_processing_backend: 'azure' },
    template(),
  );

  it('opens on the defaults, keeps what was entered and drops the rest', () => {
    expect(
      getBackendSettingValues(asked, {
        subscription_id: 'sub',
        default_account: 'gone',
      }),
    ).toEqual({ subscription_id: 'sub', region: 'westeurope', dry: false });
  });

  it('requires a value of the setting type', () => {
    const [, , , maxVms] = asked[0].settings;
    expect(checkBackendSetting(maxVms, undefined)).toBe(
      'This field is required.',
    );
    expect(checkBackendSetting(maxVms, 1.5)).toBe('Enter a whole number.');
    expect(checkBackendSetting(maxVms, 2)).toBeUndefined();
  });

  it('sends the settings entered', () => {
    const request = buildCreateRequest(
      {
        template: template({ agent_roles: {} }),
        name: 'Alps',
        category: { uuid: 'category-uuid', url: '', title: '' },
        parameters: {},
        agent_roles: {},
        custom_backends: [],
        backend_settings: { subscription_id: 'sub', tenant_id: '' },
      },
      'customer-uuid',
      true,
    );
    expect(request.backend_settings).toEqual({ subscription_id: 'sub' });
  });
});
