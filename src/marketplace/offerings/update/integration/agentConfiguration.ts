import { cloneDeep, get, isEqual, unset } from 'es-toolkit/compat';
import {
  AgentConfiguration,
  AgentConfigurationRequest,
  ProviderOfferingDetails,
} from 'waldur-js-client';

import { getErrorBody } from '@/core/ErrorMessageFormatter';
import { translate } from '@/i18n';
import { isSiteAgentOfferingType } from '@/site-agent/constants';

// The role fields of an agent configuration, in the order the agent documents
// them, with the role the plugin catalogue lists a backend for.
export const AGENT_ROLE_FIELDS = [
  { field: 'order_processing_backend', role: 'order_processing' },
  { field: 'membership_sync_backend', role: 'membership_sync' },
  { field: 'reporting_backend', role: 'reporting' },
  { field: 'username_management_backend', role: 'username_management' },
] as const;

export type AgentRoleField = (typeof AGENT_ROLE_FIELDS)[number]['field'];

// What the agent uses for a switch the configuration leaves out
// (waldur_site_agent/common/structures.py). Shown as the value of an unset
// switch, and not written back when saved unchanged from it.
export const AGENT_SWITCH_DEFAULTS = {
  event_settings: { stomp_enabled: false, websocket_use_tls: true },
  agent_settings: {
    resource_import_enabled: false,
    username_reconciliation_enabled: false,
    preserve_unmanaged_backend_users: false,
    omit_anomalous_usage_components: false,
  },
} as const;

// Role backends, custom backends, every event setting and three agent settings
// (TRUST_SENSITIVE_AGENT_SETTINGS in mastermind's agent_configuration.py) need
// OFFERING.UPDATE_AGENT_CONFIGURATION; the section marks them.
const BLOCK_KEYS = ['event_settings', 'agent_settings'] as const;
const JSON_KEYS = ['backend_settings', 'backend_components'];

/**
 * Whether the offering page shows the agent configuration: a site-agent
 * offering, read by someone the backend shows the configuration to. It is
 * dropped from the payload of anyone who may not see the offering's secret
 * options, exactly as `secret_options` is.
 */
export const isAgentConfigurationVisible = (
  offering: Pick<ProviderOfferingDetails, 'type' | 'agent_configuration'>,
): boolean =>
  isSiteAgentOfferingType(offering?.type) &&
  offering.agent_configuration !== undefined;

const isUnset = (value: unknown) =>
  value === undefined ||
  value === null ||
  value === '' ||
  (Array.isArray(value) && value.length === 0) ||
  (typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).length === 0);

const withoutUnset = (data: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(data).filter(([, value]) => !isUnset(value)),
  );

/** A JSON object typed into an editor, or the object it already is. */
const parseJsonObject = (value: unknown): Record<string, unknown> => {
  if (typeof value !== 'string') {
    return (value as Record<string, unknown>) ?? {};
  }
  if (!value.trim()) {
    return {};
  }
  return JSON.parse(value);
};

/** Why a JSON editor's text cannot be saved, if it cannot. */
export const validateJsonObject = (value: unknown): string | undefined => {
  if (typeof value !== 'string' || !value.trim()) {
    return undefined;
  }
  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return 'object';
    }
  } catch {
    return 'syntax';
  }
  return undefined;
};

/**
 * The agent configuration to send after changing part of it.
 *
 * update_integration replaces the whole configuration, so the change is laid
 * over the stored one. Event and agent settings are merged key by key; the
 * JSON blocks and every other key are replaced as a whole. An emptied value
 * is left out rather than sent: the serializer refuses a blank host or a null
 * switch, and the agent reads a missing key as its default. A switch saved at
 * the agent's default is left out too: written out it would change the
 * version of the served configuration, and be reported as a change of a
 * setting that needs extra permission, while the agent behaves the same.
 */
export const mergeAgentConfiguration = (
  stored: AgentConfiguration | undefined,
  change: Record<string, unknown> | undefined,
): AgentConfigurationRequest => {
  const current: Record<string, any> = stored ?? {};
  const next: Record<string, any> = { ...current };
  Object.entries(change ?? {}).forEach(([key, value]) => {
    if ((BLOCK_KEYS as readonly string[]).includes(key)) {
      const block = { ...(current[key] ?? {}) };
      const defaults = AGENT_SWITCH_DEFAULTS[key] ?? {};
      Object.entries((value as Record<string, unknown>) ?? {}).forEach(
        ([name, item]) => {
          if (name in defaults && defaults[name] === item) {
            delete block[name];
          } else {
            block[name] = item;
          }
        },
      );
      next[key] = withoutUnset(block);
    } else if (JSON_KEYS.includes(key)) {
      next[key] = parseJsonObject(value);
    } else {
      next[key] = value;
    }
  });
  return withoutUnset(next);
};

// The edit field that saves the role backends and the backend settings in one
// request, for a switch between backends whose settings exclude each other.
export const ROLES_AND_SETTINGS = 'roles_and_settings';

const ROLES_AND_SETTINGS_KEYS = [
  ...AGENT_ROLE_FIELDS.map(({ field }) => field),
  'backend_settings',
];

/** The roles and backend settings of a configuration, as one object. */
export const getRolesAndSettings = (configuration: AgentConfiguration) => ({
  ...Object.fromEntries(
    AGENT_ROLE_FIELDS.map(({ field }) => [field, configuration[field] ?? '']),
  ),
  backend_settings: configuration.backend_settings ?? {},
});

/**
 * The change the combined editor's text stands for: every role and the
 * backend settings, a role left out or blank being cleared.
 */
export const expandRolesAndSettings = (
  value: unknown,
): Record<string, unknown> => {
  const parsed = parseJsonObject(value);
  return {
    ...Object.fromEntries(
      AGENT_ROLE_FIELDS.map(({ field }) => [field, parsed[field] ?? null]),
    ),
    backend_settings: parsed.backend_settings ?? {},
  };
};

/** Why the combined editor's text cannot be saved, if it cannot. */
export const validateRolesAndSettings = (
  value: unknown,
): string | undefined => {
  if (typeof value !== 'string' || validateJsonObject(value)) {
    return undefined;
  }
  const unknown = Object.keys(parseJsonObject(value)).filter(
    (key) => !ROLES_AND_SETTINGS_KEYS.includes(key),
  );
  return unknown.length
    ? translate('Only roles and backend_settings belong here: {keys}.', {
        keys: unknown.join(', '),
      })
    : undefined;
};

// The roles the agent runs; username management is set apart.
const agentRoles = (configuration: Record<string, any>) =>
  AGENT_ROLE_FIELDS.filter(
    ({ field }) =>
      field !== 'username_management_backend' && Boolean(configuration[field]),
  );

/**
 * Why a save that clears the last agent role is refused: with no role set
 * the agent configuration is generated with slurm for every role, which is
 * not what clearing one says.
 */
export const clearedLastRole = (
  current: Record<string, any>,
  next: Record<string, any>,
  path?: string,
): string | undefined => {
  if (!agentRoles(current).length || agentRoles(next).length) {
    return undefined;
  }
  return path === ROLES_AND_SETTINGS
    ? translate(
        'Set at least one of order processing, membership sync or reporting.',
      )
    : translate(
        'This would leave no role set, and with none the agent runs slurm for order processing, membership sync and reporting. Choose another backend instead, or set another role first.',
      );
};

/** The keys a whole-object editor replaces, by the path it saves. */
export const replacedKeys = (path: string): string[] =>
  path === ROLES_AND_SETTINGS
    ? ROLES_AND_SETTINGS_KEYS
    : JSON_KEYS.includes(path)
      ? [path]
      : [];

/**
 * Which of the keys a whole-object editor replaces differ between the
 * configuration it was opened on and the one stored now. Such an editor
 * sends a value the user built from what they saw, so saving it over a
 * change made meanwhile would silently undo that change. An empty value and
 * a missing one are the same.
 */
export const changedSinceOpened = (
  opened: Record<string, any>,
  current: Record<string, any>,
  keys: string[],
): string[] =>
  keys.filter(
    (key) =>
      !isEqual(
        isUnset(opened[key]) ? undefined : opened[key],
        isUnset(current[key]) ? undefined : current[key],
      ),
  );

// The top-level path of the one setting an edit field saves: a block key and
// the setting in it, or a key of the configuration.
export const editedPath = (change: Record<string, any>): string => {
  const [key] = Object.keys(change ?? {});
  if ((BLOCK_KEYS as readonly string[]).includes(key)) {
    const [name] = Object.keys(change[key] ?? {});
    return name ? `${key}.${name}` : key;
  }
  return key;
};

/** Server errors as `dotted.path: message` lines. */
const flattenErrors = (errors: unknown, prefix = ''): string[] => {
  const line = (message: string) =>
    prefix ? `${prefix}: ${message}` : message;
  if (errors === undefined || errors === null) {
    return [];
  }
  if (Array.isArray(errors)) {
    return errors.every((item) => typeof item === 'string')
      ? [line(errors.join(' '))]
      : errors.flatMap((item, index) =>
          flattenErrors(item, `${prefix}[${index}]`),
        );
  }
  if (typeof errors === 'object') {
    return Object.entries(errors).flatMap(([key, value]) =>
      flattenErrors(value, prefix ? `${prefix}.${key}` : key),
    );
  }
  return [line(String(errors))];
};

// Fields the agent takes from the offering's own components, which
// backend_components refuses (OFFERING_COMPONENT_FIELDS in mastermind).
const OFFERING_COMPONENT_FIELDS = new Set([
  'type',
  'name',
  'billing_type',
  'limit_amount',
  'backend_id',
  'product_code',
  'measured_unit',
  'unit_factor',
  'accounting_type',
  'label',
  'limit',
  'description',
  'min_value',
  'max_value',
  'max_available_limit',
  'default_limit',
  'limit_period',
  'article_code',
  'is_boolean',
  'is_prepaid',
  'min_prepaid_duration',
  'max_prepaid_duration',
  'prepaid_duration_step',
]);

const namesOfferingComponentField = (errors: unknown) =>
  Boolean(errors) &&
  typeof errors === 'object' &&
  Object.values(errors).some(
    (fields) =>
      fields &&
      typeof fields === 'object' &&
      Object.keys(fields).some((name) => OFFERING_COMPONENT_FIELDS.has(name)),
  );

// A body that is not about the configuration: a detail, a list of messages,
// or field errors, shown plainly rather than as `detail: …` or `0: …`.
const plainErrors = (body: Record<string, any>): string[] => {
  if (typeof body.detail === 'string') {
    return [body.detail];
  }
  const keys = Object.keys(body);
  if (keys.length && keys.every((key) => /^\d+$/.test(key))) {
    return keys.flatMap((key) => flattenErrors(body[key]));
  }
  if (keys.length === 1 && keys[0] === 'non_field_errors') {
    return flattenErrors(body.non_field_errors);
  }
  return flattenErrors(body);
};

/**
 * What to show under an edit field when saving it was refused, as lines; or
 * nothing, when the refusal is not one to show there (a server error, say).
 *
 * A save sends the whole configuration, so a 400 may be about another part
 * of it -- most often the backend settings a newly chosen backend requires --
 * which is listed too, with where to fix it. A 403 names the settings that
 * need the permission to change the agent configuration.
 */
export const describeRefusal = (
  error: any,
  path: string,
): string[] | undefined => {
  const status = error?.status ?? error?.response?.status;
  const body = getErrorBody(error);
  if (status === 403) {
    // The server's detail names the settings; it is shown as sent, since it
    // may be translated.
    const lines = [
      translate(
        "This change needs the permission to change the offering's agent configuration. Ask an organization owner or staff.",
      ),
    ];
    if (typeof body?.detail === 'string') {
      lines.push(body.detail);
    }
    return lines;
  }
  if (status !== 400 || !body) {
    return undefined;
  }
  const errors = body.agent_configuration;
  if (errors === undefined) {
    return plainErrors(body);
  }
  if (!errors || typeof errors !== 'object' || Array.isArray(errors)) {
    return flattenErrors(errors);
  }
  const own = get(errors, path);
  const others = cloneDeep(errors);
  unset(others, path);
  const otherLines = flattenErrors(others);
  const lines = [...flattenErrors(own), ...otherLines];
  if (path === 'backend_components' && namesOfferingComponentField(own)) {
    lines.push(
      translate(
        "Unit, unit factor and limits are set on the offering's components (Accounting → Components).",
      ),
    );
  }
  const refuses = (key: string) =>
    path !== key && otherLines.some((line) => line.startsWith(`${key}.`));
  // A backend whose settings the current one refuses cannot be reached one
  // field at a time: roles and settings are saved together instead.
  if (path !== ROLES_AND_SETTINGS && refuses('backend_settings')) {
    lines.push(
      translate(
        'Change the backends and their settings in one save with "Edit roles and backend settings together" on the Backends tab.',
      ),
    );
  }
  if (refuses('backend_components')) {
    lines.push(
      translate(
        'Fix the backend components on the Backend settings tab first.',
      ),
    );
  }
  return lines;
};
