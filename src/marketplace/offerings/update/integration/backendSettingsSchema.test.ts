import { describe, expect, it } from 'vitest';

import {
  filterSettingGroups,
  getBackendSettings,
  getCommonSettingKeys,
  groupBackendSettings,
  getBackendsInUse,
  getMissingRequiredSettings,
  getPluginSettings,
  getRoleBackend,
  getSettingKind,
  groupSettingsByBackend,
  toSettingValue,
} from './backendSettingsSchema';

const root = {
  $defs: {
    Mode: { enum: ['fast', 'safe'], type: 'string', title: 'Mode' },
    Ldap: { type: 'object', properties: { uri: { type: 'string' } } },
  },
};

const slurm = {
  name: 'slurm',
  roles: ['order_processing', 'membership_sync', 'reporting'],
  secret_settings: ['backend_settings.ldap.bind_password'],
  settings_schema: {
    ...root,
    properties: {
      customer_prefix: { title: 'Customer Prefix', type: 'string' },
      default_account: {
        title: 'Default Account',
        description: 'The account new ones go under.',
        type: 'string',
      },
      cpu_limit: {
        title: 'CPU limit',
        anyOf: [{ type: 'integer' }, { type: 'null' }],
        default: null,
      },
      enable_qos: { title: 'Enable QoS', type: 'boolean', default: true },
      mode: { allOf: [{ $ref: '#/$defs/Mode' }], default: 'safe' },
      ldap: {
        anyOf: [{ $ref: '#/$defs/Ldap' }, { type: 'null' }],
        default: null,
      },
      api_token: { title: 'API token', type: 'string', secret: true },
    },
    required: ['customer_prefix', 'default_account'],
  },
} as any;

const azure = {
  name: 'azure',
  roles: ['order_processing', 'reporting'],
  secret_settings: ['client_secret'],
  settings_schema: {
    properties: {
      subscription_id: { title: 'Subscription Id', type: 'string' },
      tenant_id: { title: 'Tenant Id', type: 'string' },
      client_secret: { title: 'Client Secret', type: 'string' },
      default_account: { title: 'Default Account', type: 'string' },
    },
    required: ['subscription_id', 'tenant_id', 'client_secret'],
  },
} as any;

describe('getSettingKind', () => {
  it.each([
    [{ type: 'string' }, 'string'],
    [{ type: 'integer' }, 'integer'],
    [{ type: 'number' }, 'number'],
    [{ type: 'boolean' }, 'boolean'],
    [{ anyOf: [{ type: 'string' }, { type: 'null' }] }, 'string'],
    [{ type: ['integer', 'null'] }, 'integer'],
    [{ type: 'array', items: { type: 'string' } }, 'json'],
    [{ type: 'object' }, 'json'],
    [{ anyOf: [{ $ref: '#/$defs/Ldap' }, { type: 'null' }] }, 'json'],
    [{ anyOf: [{ type: 'string' }, { type: 'integer' }] }, 'json'],
    [{}, 'json'],
  ])('reads %j as %s', (property, kind) => {
    expect(getSettingKind(root, property).kind).toBe(kind);
  });

  it('offers the choices of an enum, behind a reference', () => {
    expect(
      getSettingKind(root, {
        anyOf: [{ $ref: '#/$defs/Mode' }, { type: 'null' }],
      }),
    ).toEqual({ kind: 'enum', options: ['fast', 'safe'] });
    expect(getSettingKind(root, { allOf: [{ $ref: '#/$defs/Mode' }] })).toEqual(
      { kind: 'enum', options: ['fast', 'safe'] },
    );
  });
});

describe('getPluginSettings', () => {
  it('describes each setting from the schema', () => {
    const settings = getPluginSettings(slurm);
    expect(
      settings.find((setting) => setting.key === 'default_account'),
    ).toEqual({
      key: 'default_account',
      backend: 'slurm',
      title: 'Default Account',
      description: 'The account new ones go under.',
      kind: 'string',
      options: undefined,
      default: undefined,
      required: true,
    });
    expect(
      settings.find((setting) => setting.key === 'enable_qos'),
    ).toMatchObject({ kind: 'boolean', default: true, required: false });
    // A null default is no default.
    expect(
      settings.find((setting) => setting.key === 'cpu_limit'),
    ).toMatchObject({ kind: 'integer', default: undefined });
    // Without a title, the key names it, readably.
    expect(settings.find((setting) => setting.key === 'mode')).toMatchObject({
      title: 'Mode',
      kind: 'enum',
      default: 'safe',
    });
  });

  it('leaves out secrets, marked in the schema or listed by the plugin', () => {
    expect(
      getPluginSettings(slurm).map((setting) => setting.key),
    ).not.toContain('api_token');
    expect(getPluginSettings(azure).map((setting) => setting.key)).toEqual([
      'subscription_id',
      'tenant_id',
      'default_account',
    ]);
  });

  // A secret inside a block does not hide the block.
  it('keeps a block that holds a secret', () => {
    expect(getPluginSettings(slurm).map((setting) => setting.key)).toContain(
      'ldap',
    );
  });

  it('has no settings without a schema', () => {
    expect(
      getPluginSettings({ name: 'base', settings_schema: null } as any),
    ).toEqual([]);
  });
});

describe('getBackendsInUse', () => {
  it('lists the stored backends in role order, each once', () => {
    expect(
      getBackendsInUse({
        order_processing_backend: 'azure',
        reporting_backend: 'slurm',
        membership_sync_backend: 'azure',
        username_management_backend: 'ldap',
      }),
    ).toEqual(['azure', 'slurm', 'ldap']);
  });

  it('uses slurm and base while no agent role is set', () => {
    expect(getBackendsInUse({})).toEqual(['slurm', 'base']);
  });

  it('uses base for unset username management', () => {
    expect(getBackendsInUse({ reporting_backend: 'waldur' })).toEqual([
      'waldur',
      'base',
    ]);
  });
});

describe('groupSettingsByBackend', () => {
  it('lists a shared setting once, under the first backend', () => {
    const groups = groupSettingsByBackend(['slurm', 'azure'], [slurm, azure]);
    expect(groups.map(({ backend }) => backend)).toEqual(['slurm', 'azure']);
    expect(groups[1].settings.map((setting) => setting.key)).toEqual([
      'subscription_id',
      'tenant_id',
    ]);
    expect(
      groupSettingsByBackend(
        ['azure', 'slurm'],
        [slurm, azure],
      )[0].settings.map((setting) => setting.key),
    ).toContain('default_account');
  });

  it('leaves out a backend the catalogue does not describe', () => {
    expect(
      groupSettingsByBackend(['site-plugin', 'slurm'], [slurm]).map(
        ({ backend }) => backend,
      ),
    ).toEqual(['slurm']);
  });
});

describe('getMissingRequiredSettings', () => {
  it('lists the required settings left unset, without secrets', () => {
    expect(
      getMissingRequiredSettings(['slurm', 'azure'], [slurm, azure], {
        customer_prefix: 'c_',
        default_account: null,
        tenant_id: 't',
      }).map((setting) => setting.key),
    ).toEqual(['default_account', 'subscription_id']);
  });

  it('counts an empty string as set, like an empty prefix', () => {
    expect(
      getMissingRequiredSettings(['slurm'], [slurm], {
        customer_prefix: '',
        default_account: '',
      }).map((setting) => setting.key),
    ).toEqual([]);
  });
});

describe('toSettingValue', () => {
  const [setting] = getPluginSettings(slurm);

  it('parses JSON typed as text', () => {
    expect(
      toSettingValue({ ...setting, kind: 'json' }, '{"uri": "ldap://x"}'),
    ).toEqual({ uri: 'ldap://x' });
  });

  it('converts a number typed as text', () => {
    expect(toSettingValue({ ...setting, kind: 'integer' }, '12')).toBe(12);
  });

  it('keeps text and empty values', () => {
    expect(toSettingValue(setting, '12')).toBe('12');
    expect(toSettingValue({ ...setting, kind: 'json' }, '')).toBe('');
  });
});

describe('getRoleBackend', () => {
  it('reads an unset agent role as off once another is set', () => {
    const configuration = { reporting_backend: 'waldur' };
    expect(getRoleBackend(configuration, 'reporting_backend')).toBe('waldur');
    expect(
      getRoleBackend(configuration, 'membership_sync_backend'),
    ).toBeUndefined();
    expect(getRoleBackend(configuration, 'username_management_backend')).toBe(
      'base',
    );
  });

  it('reads every agent role as slurm while none is set', () => {
    expect(getRoleBackend({}, 'order_processing_backend')).toBe('slurm');
  });
});

describe('getBackendSettings', () => {
  it('has no settings for a backend without a schema', () => {
    expect(getBackendSettings('site-plugin', [slurm])).toBeUndefined();
    expect(
      getBackendSettings('base', [
        { name: 'base', settings_schema: null },
      ] as any),
    ).toBeUndefined();
  });

  it('lists every setting of the backend, shared or not', () => {
    expect(
      getBackendSettings('azure', [slurm, azure])?.map(({ key }) => key),
    ).toContain('default_account');
  });
});

describe('getCommonSettingKeys', () => {
  it('keeps the keys every plugin with settings declares', () => {
    expect([
      ...getCommonSettingKeys([
        slurm,
        azure,
        { name: 'base', settings_schema: null } as any,
        { name: 'empty', settings_schema: { properties: {} } } as any,
      ]),
    ]).toEqual(['default_account']);
  });

  it('leaves out username management plugins, which share no base settings', () => {
    expect([
      ...getCommonSettingKeys([
        slurm,
        azure,
        {
          name: 'ldap',
          roles: ['username_management'],
          settings_schema: { properties: { ldap: { type: 'object' } } },
        } as any,
      ]),
    ]).toEqual(['default_account']);
  });

  it('finds nothing common with a single plugin', () => {
    expect(getCommonSettingKeys([slurm]).size).toBe(0);
    expect(getCommonSettingKeys(undefined).size).toBe(0);
  });
});

describe('groupBackendSettings', () => {
  const settings = getPluginSettings(slurm);
  const groupKeys = (values = {}) =>
    groupBackendSettings(
      'slurm',
      settings,
      new Set(['default_account', 'cpu_limit']),
      values,
    ).map((group) => [group.id, group.settings.map(({ key }) => key)]);

  it('puts required first, then specific and common, JSON settings by meaning', () => {
    expect(groupKeys()).toEqual([
      ['required', ['customer_prefix', 'default_account']],
      ['specific', ['enable_qos', 'mode', 'ldap']],
      ['common', ['cpu_limit']],
    ]);
  });

  it('names and counts the groups, opening those with a setting set', () => {
    const groups = groupBackendSettings(
      'slurm',
      settings,
      new Set(['cpu_limit']),
      { customer_prefix: 'c_', ldap: { uri: 'ldap://x' } },
    );
    expect(
      groups.map(({ title, set, open }) => ({ title, set, open })),
    ).toEqual([
      { title: 'Required', set: 1, open: true },
      { title: 'Specific to slurm', set: 1, open: true },
      { title: 'Common to all backends', set: 0, open: false },
    ]);
  });

  it('leaves out empty groups', () => {
    expect(
      groupBackendSettings(
        'slurm',
        settings.filter(({ required }) => required),
        new Set(),
        {},
      ).map(({ id }) => id),
    ).toEqual(['required']);
  });

  // A curated group from the plugin wins over the derived ones, but not over
  // required.
  it('uses a group the schema names', () => {
    const grouped = getPluginSettings({
      ...slurm,
      settings_schema: {
        ...slurm.settings_schema,
        properties: {
          ...slurm.settings_schema.properties,
          enable_qos: { type: 'boolean', group: 'QoS' },
          ldap: { type: 'object', group: 'Directory' },
          customer_prefix: { type: 'string', group: 'Naming' },
        },
      },
    });
    expect(
      groupBackendSettings('slurm', grouped, new Set(), {}).map((group) => [
        group.id,
        group.title,
        group.settings.map(({ key }) => key),
      ]),
    ).toEqual([
      ['required', 'Required', ['customer_prefix', 'default_account']],
      ['group:QoS', 'QoS', ['enable_qos']],
      ['group:Directory', 'Directory', ['ldap']],
      ['specific', 'Specific to slurm', ['cpu_limit', 'mode']],
    ]);
  });
});

describe('filterSettingGroups', () => {
  const groups = groupBackendSettings(
    'slurm',
    getPluginSettings(slurm),
    new Set(),
    {},
  );
  const matches = (query: string) =>
    filterSettingGroups(groups, query).map((group) => [
      group.id,
      group.settings.map(({ key }) => key),
    ]);

  it('matches title, key and description, ignoring case', () => {
    expect(matches('QOS')).toEqual([['specific', ['enable_qos']]]);
    expect(matches('cpu_lim')).toEqual([['specific', ['cpu_limit']]]);
    expect(matches('NEW ONES')).toEqual([['required', ['default_account']]]);
  });

  it('keeps every group for an empty query, and none for no match', () => {
    expect(filterSettingGroups(groups, '  ')).toBe(groups);
    expect(matches('nothing like it')).toEqual([]);
  });
});
describe('a setting without a schema title', () => {
  it('is named readably from its key', () => {
    const [setting] = getBackendSettings('plain', [
      {
        name: 'plain',
        roles: ['order_processing'],
        settings_schema: {
          properties: { qos_management: { $ref: '#/$defs/Qos' } },
          $defs: { Qos: { type: 'object', title: 'QoS' } },
        },
      } as any,
    ]);
    expect(setting.title).toBe('Qos management');
  });
});
