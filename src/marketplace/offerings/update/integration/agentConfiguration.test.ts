import { describe, expect, it } from 'vitest';

import {
  BACKEND_SETTINGS_UPDATE,
  changedSinceOpened,
  clearedLastRole,
  describeRefusal,
  editedPath,
  expandRolesAndSettings,
  isAgentConfigurationVisible,
  mergeAgentConfiguration,
  replacedKeys,
  ROLES_AND_SETTINGS,
  splitSecretsByBlock,
  validateJsonObject,
  validateRolesAndSettings,
} from './agentConfiguration';

const stored = {
  order_processing_backend: 'slurm',
  membership_sync_backend: 'slurm',
  custom_backends: ['site-plugin'],
  backend_settings: { default_account: 'root', customer_prefix: 'c_' },
  backend_components: { cpu: { unit_factor_reporting: 60 } },
  event_settings: { stomp_enabled: true, stomp_ws_host: 'mq.example.org' },
  agent_settings: { resource_import_enabled: true },
};

describe('mergeAgentConfiguration', () => {
  // update_integration replaces the whole configuration.
  it('sends the whole stored configuration with one key changed', () => {
    expect(
      mergeAgentConfiguration(stored, { reporting_backend: 'slurm' }),
    ).toEqual({ ...stored, reporting_backend: 'slurm' });
  });

  it('sets one backend setting and keeps the others', () => {
    expect(
      mergeAgentConfiguration(stored, {
        [BACKEND_SETTINGS_UPDATE]: { partition: 'gpu' },
      }),
    ).toEqual({
      ...stored,
      backend_settings: {
        default_account: 'root',
        customer_prefix: 'c_',
        partition: 'gpu',
      },
    });
  });

  // The agent then uses the setting's default.
  it('removes a backend setting given as empty', () => {
    expect(
      mergeAgentConfiguration(stored, {
        [BACKEND_SETTINGS_UPDATE]: { customer_prefix: '', other: null },
      }).backend_settings,
    ).toEqual({ default_account: 'root' });
  });

  it('merges event and agent settings key by key', () => {
    expect(
      mergeAgentConfiguration(stored, {
        event_settings: { stomp_ws_port: 15671 },
        agent_settings: { omit_anomalous_usage_components: true },
      }),
    ).toEqual({
      ...stored,
      event_settings: {
        stomp_enabled: true,
        stomp_ws_host: 'mq.example.org',
        stomp_ws_port: 15671,
      },
      agent_settings: {
        resource_import_enabled: true,
        omit_anomalous_usage_components: true,
      },
    });
  });

  // The serializer refuses a blank host or a null switch; the agent reads a
  // missing key as unset.
  it('leaves an emptied value out', () => {
    const result = mergeAgentConfiguration(stored, {
      membership_sync_backend: null,
      event_settings: { stomp_ws_host: '' },
    });
    expect(result).not.toHaveProperty('membership_sync_backend');
    expect(result.event_settings).toEqual({ stomp_enabled: true });
  });

  it('leaves a follow-the-default membership sync choice out', () => {
    expect(
      mergeAgentConfiguration(
        { event_settings: { stomp_membership_sync_enabled: false } },
        { event_settings: { stomp_membership_sync_enabled: null } },
      ),
    ).toEqual({});
  });

  // An unset switch saved at the agent's default is no change, so it must not
  // reach the server as one of a setting that needs extra permission.
  it('does not write a switch saved at its default when it was unset', () => {
    expect(
      mergeAgentConfiguration(stored, {
        agent_settings: { username_reconciliation_enabled: false },
      }),
    ).toEqual(stored);
  });

  // Written out, a default changes the served configuration's version and
  // reads as a change needing extra permission; the agent behaves the same.
  it('removes a switch turned back to its default', () => {
    expect(
      mergeAgentConfiguration(stored, {
        agent_settings: { resource_import_enabled: false },
      }),
    ).not.toHaveProperty('agent_settings');
    expect(
      mergeAgentConfiguration(
        { event_settings: { websocket_use_tls: false, stomp_enabled: true } },
        { event_settings: { websocket_use_tls: true } },
      ),
    ).toEqual({ event_settings: { stomp_enabled: true } });
  });

  it('writes a switch set away from its default', () => {
    expect(
      mergeAgentConfiguration(stored, {
        agent_settings: { omit_anomalous_usage_components: true },
      }).agent_settings,
    ).toEqual({
      resource_import_enabled: true,
      omit_anomalous_usage_components: true,
    });
  });

  it('replaces the JSON blocks as a whole, from the editor text', () => {
    expect(
      mergeAgentConfiguration(stored, {
        backend_settings: '{"default_account": "other"}',
      }).backend_settings,
    ).toEqual({ default_account: 'other' });
  });

  it('drops a JSON block emptied in the editor', () => {
    expect(
      mergeAgentConfiguration(stored, { backend_components: '' }),
    ).not.toHaveProperty('backend_components');
  });

  it('starts from an empty configuration', () => {
    expect(
      mergeAgentConfiguration(undefined, {
        order_processing_backend: 'slurm',
      }),
    ).toEqual({ order_processing_backend: 'slurm' });
  });
});

describe('validateJsonObject', () => {
  it('accepts an object, or nothing', () => {
    expect(validateJsonObject('{"a": 1}')).toBeUndefined();
    expect(validateJsonObject('')).toBeUndefined();
    expect(validateJsonObject({ a: 1 })).toBeUndefined();
  });

  it('refuses broken JSON and what is not an object', () => {
    expect(validateJsonObject('{"a": ')).toBe('syntax');
    expect(validateJsonObject('[1]')).toBe('object');
    expect(validateJsonObject('null')).toBe('object');
  });
});

describe('isAgentConfigurationVisible', () => {
  it('shows it for a site-agent offering whose configuration is returned', () => {
    expect(
      isAgentConfigurationVisible({
        type: 'Marketplace.SiteAgent',
        agent_configuration: {},
      }),
    ).toBe(true);
    expect(
      isAgentConfigurationVisible({
        type: 'Marketplace.Slurm',
        agent_configuration: {},
      }),
    ).toBe(true);
  });

  it('hides it from other offerings and from who is not shown it', () => {
    expect(
      isAgentConfigurationVisible({
        type: 'Marketplace.Basic',
        agent_configuration: {},
      }),
    ).toBe(false);
    expect(isAgentConfigurationVisible({ type: 'Marketplace.SiteAgent' })).toBe(
      false,
    );
  });
});

describe('editedPath', () => {
  it('names the setting an edit field saves', () => {
    expect(editedPath({ reporting_backend: 'slurm' })).toBe(
      'reporting_backend',
    );
    expect(
      editedPath({ agent_settings: { resource_import_enabled: true } }),
    ).toBe('agent_settings.resource_import_enabled');
  });
});

describe('describeRefusal', () => {
  const refused = (status: number, body: object) => ({
    ...body,
    status,
    response: { status },
  });

  // The detail is shown as sent: it names the settings, and may be translated.
  it('shows the server detail of a 403 under a short explanation', () => {
    expect(
      describeRefusal(
        refused(403, {
          detail:
            'You do not have permission to change where the site agent connects or what it runs: agent_settings.resource_import_enabled.',
        }),
        'agent_settings.resource_import_enabled',
      ),
    ).toEqual({
      errors: [
        "This change needs the permission to change the offering's agent configuration. Ask an organization owner or staff.",
        'You do not have permission to change where the site agent connects or what it runs: agent_settings.resource_import_enabled.',
      ],
      hints: [],
    });
  });

  // A new backend is refused for the settings it requires: say where to add
  // them, as a hint rather than another error. The server names the backend
  // in the message; it goes after the path.
  it('lists the backend settings a chosen backend requires', () => {
    expect(
      describeRefusal(
        refused(400, {
          agent_configuration: {
            backend_settings: {
              target_api_url: ['waldur: This setting is required.'],
              target_offering_uuid: ['waldur: This setting is required.'],
            },
          },
        }),
        'reporting_backend',
      ),
    ).toEqual({
      errors: [
        'backend_settings.target_api_url (waldur): This setting is required.',
        'backend_settings.target_offering_uuid (waldur): This setting is required.',
      ],
      hints: [
        'Change the backends and their settings in one save with "Edit roles and backend settings together" on the Advanced (JSON) tab.',
      ],
    });
  });

  it('shows errors in a JSON block as dotted paths', () => {
    expect(
      describeRefusal(
        refused(400, {
          agent_configuration: {
            backend_components: {
              cpu: {
                unit_factor: ['Set this on the offering component itself.'],
              },
            },
          },
        }),
        'backend_components',
      ),
    ).toEqual({
      // The dialog's description already points at the offering's
      // components; the refusal does not repeat it.
      errors: ['cpu.unit_factor: Set this on the offering component itself.'],
      hints: [],
    });
  });

  it('shows the error of the field itself as it is', () => {
    expect(
      describeRefusal(
        refused(400, {
          agent_configuration: {
            event_settings: {
              stomp_ws_port: [
                'Ensure this value is less than or equal to 65535.',
              ],
            },
          },
        }),
        'event_settings.stomp_ws_port',
      ),
    ).toEqual({
      errors: ['Ensure this value is less than or equal to 65535.'],
      hints: [],
    });
  });

  it('does not send the combined editor to itself', () => {
    expect(
      describeRefusal(
        refused(400, {
          agent_configuration: {
            backend_settings: { api_url: ['ceph_s3: Unknown setting.'] },
          },
        }),
        ROLES_AND_SETTINGS,
      ),
    ).toEqual({
      errors: ['backend_settings.api_url (ceph_s3): Unknown setting.'],
      hints: [],
    });
  });

  it('puts each backend of a setting on its own line', () => {
    expect(
      describeRefusal(
        refused(400, {
          agent_configuration: {
            backend_settings: {
              qos_default: [
                'Unknown setting.',
                'slurm: Invalid value.',
                'waldur: This setting is required.',
              ],
            },
          },
        }),
        'backend_settings',
      ).errors,
    ).toEqual([
      'qos_default: Unknown setting.',
      'qos_default (slurm): Invalid value.',
      'qos_default (waldur): This setting is required.',
    ]);
  });

  it('points component errors of another field to the components', () => {
    expect(
      describeRefusal(
        refused(400, {
          agent_configuration: {
            backend_components: { cpu: { factor: ['Unknown setting.'] } },
          },
        }),
        'reporting_backend',
      ),
    ).toEqual({
      errors: ['backend_components.cpu.factor: Unknown setting.'],
      hints: ['Fix the backend components on the Advanced (JSON) tab first.'],
    });
  });

  it('shows a detail or a list of messages plainly', () => {
    expect(
      describeRefusal(refused(400, { detail: 'Offering is archived.' }), 'x'),
    ).toEqual({ errors: ['Offering is archived.'], hints: [] });
    expect(
      describeRefusal(refused(400, { 0: 'Not now.', 1: 'Try later.' }), 'x'),
    ).toEqual({ errors: ['Not now.', 'Try later.'], hints: [] });
  });

  it('leaves other failures to a notification', () => {
    expect(
      describeRefusal(refused(500, { detail: 'Server error' }), 'x'),
    ).toBeUndefined();
  });
});

describe('clearedLastRole', () => {
  // With no role set the agent is configured with slurm for every role.
  it('refuses clearing the last agent role', () => {
    expect(
      clearedLastRole(
        { reporting_backend: 'waldur', username_management_backend: 'ldap' },
        { username_management_backend: 'ldap' },
      ),
    ).toMatch(/^This would leave no role set/);
  });

  it('asks the combined editor for a role in its own words', () => {
    expect(
      clearedLastRole({ reporting_backend: 'waldur' }, {}, ROLES_AND_SETTINGS),
    ).toBe(
      'Set at least one of order processing, membership sync or reporting.',
    );
  });

  it('allows clearing a role while another stays', () => {
    expect(
      clearedLastRole(
        { reporting_backend: 'waldur', order_processing_backend: 'slurm' },
        { order_processing_backend: 'slurm' },
      ),
    ).toBeUndefined();
    expect(clearedLastRole({}, {})).toBeUndefined();
  });
});

describe('roles and backend settings together', () => {
  it('stands for every role, a missing one cleared, and the settings', () => {
    expect(
      expandRolesAndSettings(
        '{"order_processing_backend": "ceph_s3", "backend_settings": {"api_url": "x"}}',
      ),
    ).toEqual({
      order_processing_backend: 'ceph_s3',
      membership_sync_backend: null,
      reporting_backend: null,
      username_management_backend: null,
      backend_settings: { api_url: 'x' },
    });
  });

  it('refuses keys other than roles and backend settings', () => {
    expect(validateRolesAndSettings('{"event_settings": {}}')).toMatch(
      /event_settings/,
    );
    expect(
      validateRolesAndSettings('{"reporting_backend": "slurm"}'),
    ).toBeUndefined();
  });
});

describe('changedSinceOpened', () => {
  it('names the replaced keys stored differently now', () => {
    expect(
      changedSinceOpened(
        { reporting_backend: 'slurm', backend_settings: { a: 1 } },
        { reporting_backend: 'waldur', backend_settings: { a: 1 } },
        replacedKeys(ROLES_AND_SETTINGS),
      ),
    ).toEqual(['reporting_backend']);
  });

  it('takes an empty value and a missing one as the same', () => {
    expect(
      changedSinceOpened(
        { backend_components: {}, reporting_backend: '' },
        {},
        [...replacedKeys('backend_components'), 'reporting_backend'],
      ),
    ).toEqual([]);
  });

  it('guards nothing for a single field', () => {
    expect(replacedKeys('reporting_backend')).toEqual([]);
    expect(replacedKeys('agent_settings.resource_import_enabled')).toEqual([]);
  });
});

describe('splitSecretsByBlock', () => {
  const secret = (field: string, requirement: string) => ({
    field: `backend_settings.${field}`,
    requirement,
  });
  const fields = (secrets: { field: string }[]) =>
    secrets.map(({ field }) => field.replace('backend_settings.', ''));

  it('needs a secret once its block is set', () => {
    const secrets = [secret('ldap.bind_password', 'required_with_parent')];
    expect(fields(splitSecretsByBlock(secrets, {}).ifConfigured)).toEqual([
      'ldap.bind_password',
    ]);
    // An empty block is set: the agent then requires its secrets.
    expect(fields(splitSecretsByBlock(secrets, { ldap: {} }).needed)).toEqual([
      'ldap.bind_password',
    ]);
    expect(
      fields(splitSecretsByBlock(secrets, { ldap: null }).ifConfigured),
    ).toEqual(['ldap.bind_password']);
    expect(
      fields(splitSecretsByBlock(secrets, { ldap: { uri: 'x' } }).needed),
    ).toEqual(['ldap.bind_password']);
  });

  it('always needs a required secret', () => {
    const { needed } = splitSecretsByBlock(
      [secret('ldap.bind_password', 'required')],
      undefined,
    );
    expect(fields(needed)).toEqual(['ldap.bind_password']);
  });

  it('needs an optional secret only once its sub-block is set', () => {
    const secrets = [secret('ldap.welcome_email.smtp_password', 'optional')];
    expect(
      splitSecretsByBlock(secrets, { ldap: { uri: 'x' } }).ifConfigured,
    ).toHaveLength(1);
    expect(
      splitSecretsByBlock(secrets, {
        ldap: { welcome_email: { host: 'smtp' } },
      }).needed,
    ).toHaveLength(1);
  });

  it('needs a top-level secret', () => {
    expect(
      splitSecretsByBlock([secret('token', 'optional')], {}).needed,
    ).toHaveLength(1);
  });

  it('needs a secret of a collection once it has an entry', () => {
    const mapping = [secret('servers.*.password', 'required_with_parent')];
    const list = [secret('ldap[].bind_password', 'required_with_parent')];
    expect(
      splitSecretsByBlock(mapping, { servers: {} }).ifConfigured,
    ).toHaveLength(1);
    expect(
      splitSecretsByBlock(mapping, { servers: { a: {} } }).needed,
    ).toHaveLength(1);
    expect(splitSecretsByBlock(list, { ldap: [] }).ifConfigured).toHaveLength(
      1,
    );
    expect(
      splitSecretsByBlock(list, { ldap: [{ uri: 'x' }] }).needed,
    ).toHaveLength(1);
  });
});
