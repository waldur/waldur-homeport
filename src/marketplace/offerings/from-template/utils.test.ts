import { describe, expect, it } from 'vitest';

import {
  buildCreateRequest,
  checkParameterValue,
  describeCreateRefusal,
  getParameterDefaults,
  getTemplateRoles,
} from './utils';

const parameter = (overrides = {}) =>
  ({
    key: 'cluster_name',
    label: 'Cluster name',
    description: '',
    type: 'string',
    required: true,
    default: null,
    paths: ['offering.backend_id'],
    ...overrides,
  }) as any;

const template = {
  uuid: 'template-uuid',
  name: 'SLURM',
  version: 2,
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
    parameter(),
    parameter({ key: 'default_account', required: true, default: 'root' }),
    parameter({ key: 'prefix', required: false, default: '' }),
  ],
} as any;

describe('checkParameterValue', () => {
  it('requires a value only of a required parameter', () => {
    expect(checkParameterValue(parameter(), '')).toBe(
      'This field is required.',
    );
    expect(checkParameterValue(parameter(), undefined)).toBe(
      'This field is required.',
    );
    expect(
      checkParameterValue(parameter({ required: false }), ''),
    ).toBeUndefined();
  });

  it('takes only a whole number for an integer', () => {
    const integer = parameter({ type: 'integer' });
    expect(checkParameterValue(integer, 4)).toBeUndefined();
    expect(checkParameterValue(integer, 4.5)).toBe('Enter a whole number.');
    expect(checkParameterValue(integer, '4x')).toBe('Enter a whole number.');
  });

  it('takes a fraction for a number', () => {
    const number = parameter({ type: 'number' });
    expect(checkParameterValue(number, 0.5)).toBeUndefined();
    expect(checkParameterValue(number, 'half')).toBe('Enter a number.');
  });

  it('takes only one of the choices', () => {
    const policy = parameter({ choices: ['anonymized', 'full_name'] });
    expect(checkParameterValue(policy, 'full_name')).toBeUndefined();
    expect(checkParameterValue(policy, 'freeipa')).toBe(
      'Choose one of: anonymized, full_name.',
    );
  });

  it('matches the pattern against the whole value, as the server does', () => {
    const cluster = parameter({ pattern: '[a-z]+' });
    expect(checkParameterValue(cluster, 'alps')).toBeUndefined();
    expect(checkParameterValue(cluster, 'alps-2')).toBe(
      'Does not match the pattern [a-z]+.',
    );
  });

  it('leaves a pattern this browser cannot compile to the server', () => {
    expect(
      checkParameterValue(parameter({ pattern: '(?P<name>x)' }), 'y'),
    ).toBeUndefined();
  });

  it('refuses a value longer than the server takes', () => {
    expect(checkParameterValue(parameter(), 'x'.repeat(1001))).toBe(
      'At most 1000 characters.',
    );
  });
});

describe('template values', () => {
  it('opens each parameter with its default', () => {
    expect(getParameterDefaults(template)).toEqual({ default_account: 'root' });
  });

  it('opens a switch without a default as No, which answers a required one', () => {
    const withSwitch = {
      ...template,
      parameters: [
        parameter({ key: 'gpu', type: 'boolean', required: true }),
        parameter({ key: 'homedirs', type: 'boolean', default: true }),
      ],
    };
    expect(getParameterDefaults(withSwitch)).toEqual({
      gpu: false,
      homedirs: true,
    });
    expect(
      checkParameterValue(withSwitch.parameters[0], false),
    ).toBeUndefined();
  });

  it("reads the template's role backends", () => {
    expect(getTemplateRoles(template)).toEqual({
      order_processing_backend: 'slurm',
      membership_sync_backend: 'slurm',
      reporting_backend: 'slurm',
      username_management_backend: 'base',
    });
  });
});

describe('buildCreateRequest', () => {
  const values = {
    template,
    name: ' Alps ',
    category: { uuid: 'category-uuid', url: '', title: 'HPC' },
    parameters: { cluster_name: 'alps', prefix: '' },
    agent_roles: getTemplateRoles(template),
    custom_backends: [],
    backend_settings: {},
  };

  it('sends the values, leaving out a blank parameter', () => {
    expect(buildCreateRequest(values, 'customer-uuid', true)).toEqual({
      customer: 'customer-uuid',
      category: 'category-uuid',
      name: 'Alps',
      parameters: { cluster_name: 'alps' },
      dry_run: true,
    });
  });

  it("sends only the roles that differ from the template's", () => {
    const request = buildCreateRequest(
      {
        ...values,
        agent_roles: {
          ...values.agent_roles,
          reporting_backend: 'site-usage',
          membership_sync_backend: '',
        },
        custom_backends: ['site-usage', 'unused'],
      },
      'customer-uuid',
      false,
    );
    expect(request.agent_roles).toEqual({
      reporting_backend: 'site-usage',
      membership_sync_backend: '',
      custom_backends: ['site-usage'],
    });
    expect(request.dry_run).toBe(false);
  });
});

describe('describeCreateRefusal', () => {
  it('lists field errors as lines, leaving the findings to their table', () => {
    expect(
      describeCreateRefusal({
        data: {
          parameters: { cluster_name: ['Expected a string.'] },
          agent_configuration: {
            backend_settings: {
              cscs_dwdi_api_url: [
                'cscs-dwdi-compute: This setting is required.',
              ],
            },
          },
          findings: [{ rule: 'slurm_component_tres' }],
        },
      }),
    ).toEqual([
      'parameters.cluster_name: Expected a string.',
      'agent_configuration.backend_settings.cscs_dwdi_api_url (cscs-dwdi-compute): This setting is required.',
    ]);
  });

  it('shows a detail as it is', () => {
    expect(
      describeCreateRefusal({
        data: { detail: 'You do not have permission.' },
      }),
    ).toEqual(['You do not have permission.']);
  });
});
