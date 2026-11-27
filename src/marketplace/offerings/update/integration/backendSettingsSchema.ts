import { AgentPlugin } from 'waldur-js-client';

import { translate } from '@/i18n';

import {
  AGENT_ROLE_FIELDS,
  AgentRoleField,
  DEFAULT_ROLE_BACKENDS,
} from './agentConfiguration';

/** The control a backend setting is edited with. */
export type SettingKind =
  'string' | 'integer' | 'number' | 'boolean' | 'enum' | 'json';

/** One backend setting, as the plugin catalogue's schema describes it. */
export interface BackendSetting {
  key: string;
  /** The backend that declares it; the first in role order when shared. */
  backend: string;
  title: string;
  description?: string;
  kind: SettingKind;
  /** The choices of an enum. */
  options?: (string | number)[];
  /** The schema's default; `undefined` when it has none (or `null`). */
  default?: unknown;
  required: boolean;
  /** A group the schema names for it, curated by the plugin. */
  group?: string;
}

type Schema = Record<string, any>;

// A setting whose schema gives no title (one that refers to a definition,
// such as qos_management) is shown by its name, readably.
const humanizeKey = (key: string) =>
  key
    .split('_')
    .filter(Boolean)
    .map((word, index) =>
      index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word,
    )
    .join(' ');

// `#/$defs/Name` (or the older `#/definitions/Name`) inside the same schema.
const resolveRef = (root: Schema, node: Schema): Schema => {
  const ref = node?.$ref;
  if (typeof ref !== 'string') {
    return node;
  }
  const [, section, name] = ref.split('/');
  return root?.[section]?.[name] ?? {};
};

const isNullType = (node: Schema) =>
  node?.type === 'null' || (Array.isArray(node?.enum) && node.enum[0] === null);

/**
 * The one type a property stands for: an optional value (`anyOf` with
 * `null`), a pydantic `allOf` wrapper around a `$ref`, and the `$ref` itself
 * are unwrapped. Anything left ambiguous is returned as it is.
 */
const unwrap = (root: Schema, property: Schema): Schema => {
  let node = resolveRef(root, property);
  for (let depth = 0; depth < 5; depth++) {
    const variants = node.anyOf ?? node.oneOf;
    if (Array.isArray(variants)) {
      const rest = variants.filter((variant: Schema) => !isNullType(variant));
      if (rest.length !== 1) {
        return node;
      }
      node = resolveRef(root, rest[0]);
    } else if (Array.isArray(node.allOf) && node.allOf.length === 1) {
      node = resolveRef(root, node.allOf[0]);
    } else {
      return node;
    }
  }
  return node;
};

/** The control for a schema property; JSON for whatever a form cannot hold. */
export const getSettingKind = (
  root: Schema,
  property: Schema,
): { kind: SettingKind; options?: (string | number)[] } => {
  const node = unwrap(root, property);
  if (Array.isArray(node.enum)) {
    const options = node.enum.filter(
      (item: unknown) => typeof item === 'string' || typeof item === 'number',
    );
    if (options.length) {
      return { kind: 'enum', options };
    }
  }
  const types = (Array.isArray(node.type) ? node.type : [node.type]).filter(
    (type: unknown) => type !== 'null',
  );
  if (types.length === 1) {
    const [type] = types;
    if (
      type === 'string' ||
      type === 'integer' ||
      type === 'number' ||
      type === 'boolean'
    ) {
      return { kind: type };
    }
  }
  return { kind: 'json' };
};

// A secret named in `secret_settings`, as `backend_settings.<key>` or `<key>`.
// A secret inside a block (`ldap.bind_password`) does not make the block one.
const secretKeys = (plugin: AgentPlugin) =>
  new Set(
    (plugin.secret_settings ?? [])
      .map((path) => path.replace(/^backend_settings\./, ''))
      .filter((path) => !/[.*[]/.test(path)),
  );

/**
 * The settings a backend declares, except its secrets: those stay in the
 * agent configuration file and are never shown, prefilled or sent.
 */
export const getPluginSettings = (plugin: AgentPlugin): BackendSetting[] => {
  const schema = (plugin.settings_schema ?? {}) as Schema;
  const properties: Record<string, Schema> = schema.properties ?? {};
  const required = new Set<string>(schema.required ?? []);
  const secrets = secretKeys(plugin);
  return Object.entries(properties)
    .filter(([key, property]) => property?.secret !== true && !secrets.has(key))
    .map(([key, property]) => {
      const { kind, options } = getSettingKind(schema, property);
      return {
        key,
        backend: plugin.name,
        title: property.title || humanizeKey(key),
        description: property.description || undefined,
        kind,
        options,
        default: property.default ?? undefined,
        required: required.has(key),
        group:
          typeof property.group === 'string' && property.group.trim()
            ? property.group.trim()
            : undefined,
      };
    });
};

/**
 * The backend the agent runs for a role: the stored one, and while no agent
 * role is set, slurm for those and base for username management (which is
 * base whenever it is left unset). `undefined` is a role that is off.
 */
export const getRoleBackend = (
  configuration: Record<string, any>,
  field: AgentRoleField,
): string | undefined => {
  if (configuration[field]) {
    return configuration[field];
  }
  const noAgentRole = !AGENT_ROLE_FIELDS.some(
    (role) =>
      role.field !== 'username_management_backend' &&
      Boolean(configuration[role.field]),
  );
  return noAgentRole || field === 'username_management_backend'
    ? DEFAULT_ROLE_BACKENDS[field]
    : undefined;
};

/** The backends the agent runs, in role order, each once. */
export const getBackendsInUse = (
  configuration: Record<string, any>,
): string[] => [
  ...new Set(
    AGENT_ROLE_FIELDS.map(({ field }) =>
      getRoleBackend(configuration, field),
    ).filter(Boolean) as string[],
  ),
];

/**
 * The settings of one backend, or `undefined` when the catalogue has no
 * schema for it (a custom backend, or one with no settings of its own).
 */
export const getBackendSettings = (
  backend: string,
  plugins: AgentPlugin[] | undefined,
): BackendSetting[] | undefined => {
  const plugin = plugins?.find((item) => item.name === backend);
  return plugin?.settings_schema ? getPluginSettings(plugin) : undefined;
};

/**
 * The settings of each backend in use, for the backends the catalogue
 * describes. The settings are one object for every backend, so a key several
 * backends declare is one value, kept under the first of them: each key once
 * across the backends, to look settings up or ask for the missing ones.
 */
export const groupSettingsByBackend = (
  backends: string[],
  plugins: AgentPlugin[] | undefined,
): { backend: string; settings: BackendSetting[] }[] => {
  const seen = new Set<string>();
  return backends
    .map((backend) => {
      const plugin = plugins?.find((item) => item.name === backend);
      const settings = plugin
        ? getPluginSettings(plugin).filter((setting) => {
            if (seen.has(setting.key)) {
              return false;
            }
            seen.add(setting.key);
            return true;
          })
        : [];
      return { backend, settings };
    })
    .filter(({ settings }) => settings.length > 0);
};

/**
 * An unset value: the agent then uses the setting's default. An empty string
 * is a value (an empty account prefix, say), not unset.
 */
export const isSettingUnset = (value: unknown) =>
  value === undefined || value === null;

/**
 * The required settings of these backends that the backend settings leave
 * unset, each once.
 */
export const getMissingRequiredSettings = (
  backends: string[],
  plugins: AgentPlugin[] | undefined,
  backendSettings: Record<string, unknown> | undefined,
): BackendSetting[] =>
  groupSettingsByBackend(backends, plugins).flatMap(({ settings }) =>
    settings.filter(
      (setting) =>
        setting.required && isSettingUnset(backendSettings?.[setting.key]),
    ),
  );

/** What a setting's editor opens on when it is unset. */
export const getSettingInitialValue = (setting: BackendSetting) =>
  setting.default !== undefined
    ? setting.default
    : setting.kind === 'boolean'
      ? false
      : undefined;

/**
 * A setting's value as the API takes it: JSON typed as text parsed, a number
 * typed as text converted. Validation has checked the text beforehand.
 */
export const toSettingValue = (setting: BackendSetting, value: unknown) => {
  if (typeof value !== 'string' || value.trim() === '') {
    return value;
  }
  if (setting.kind === 'json') {
    return JSON.parse(value);
  }
  if (setting.kind === 'integer' || setting.kind === 'number') {
    const number = Number(value);
    return Number.isNaN(number) ? value : number;
  }
  return value;
};

// The roles whose plugins share the agent's base settings (prefixes, the
// default account, backend ID checks, ...). Username management plugins such
// as ldap have settings of their own only.
const AGENT_ROLES = ['order_processing', 'membership_sync', 'reporting'];

/**
 * The keys every plugin with settings that fills an agent role declares.
 * Plugins without settings of their own (base) and username management
 * plugins do not count; with fewer than two plugins to compare, nothing is
 * common.
 */
export const getCommonSettingKeys = (
  plugins: AgentPlugin[] | undefined,
): Set<string> => {
  const keySets = (plugins ?? [])
    .filter((plugin) =>
      (plugin.roles ?? []).some((role) => AGENT_ROLES.includes(role)),
    )
    .map((plugin) =>
      Object.keys(
        (plugin.settings_schema as Record<string, any>)?.properties ?? {},
      ),
    )
    .filter((keys) => keys.length > 0);
  if (keySets.length < 2) {
    return new Set();
  }
  const [first, ...rest] = keySets;
  return new Set(
    first.filter((key) => rest.every((keys) => keys.includes(key))),
  );
};

/** A group of a backend's settings, as its block shows it. */
export interface SettingGroup {
  id: string;
  title: string;
  settings: BackendSetting[];
  /** How many of them are set. */
  set: number;
  /** Shown open: always for the required ones, else when one is set. */
  open: boolean;
}

/**
 * A backend's settings in groups, in this order: the required ones; any
 * group the schema names; those specific to this backend; those every
 * backend declares. A setting edited as JSON goes where its meaning puts it.
 * Empty groups are left out. A required setting is only in the first
 * group.
 */
export const groupBackendSettings = (
  backend: string,
  settings: BackendSetting[],
  commonKeys: Set<string>,
  values: Record<string, unknown> | undefined,
): SettingGroup[] => {
  const groups = new Map<
    string,
    { title: string; settings: BackendSetting[] }
  >();
  const add = (id: string, title: string, setting: BackendSetting) => {
    if (!groups.has(id)) {
      groups.set(id, { title, settings: [] });
    }
    groups.get(id).settings.push(setting);
  };
  // The fixed groups first, so they keep their order around named ones.
  groups.set('required', { title: translate('Required'), settings: [] });
  const named: BackendSetting[] = [];
  const rest: BackendSetting[] = [];
  settings.forEach((setting) => {
    if (setting.required) {
      groups.get('required').settings.push(setting);
    } else if (setting.group) {
      named.push(setting);
    } else {
      rest.push(setting);
    }
  });
  named.forEach((setting) =>
    add(`group:${setting.group}`, setting.group, setting),
  );
  // A setting edited as JSON belongs where its meaning puts it, like any
  // other: how it is edited is not a group.
  rest
    .filter((setting) => !commonKeys.has(setting.key))
    .forEach((setting) =>
      add('specific', translate('Specific to {backend}', { backend }), setting),
    );
  rest
    .filter((setting) => commonKeys.has(setting.key))
    .forEach((setting) =>
      add('common', translate('Common to all backends'), setting),
    );
  return [...groups]
    .filter(([, group]) => group.settings.length > 0)
    .map(([id, group]) => {
      const set = group.settings.filter(
        (setting) => !isSettingUnset(values?.[setting.key]),
      ).length;
      return {
        id,
        title: group.title,
        settings: group.settings,
        set,
        open: id === 'required' || set > 0,
      };
    });
};

/**
 * The groups with only the settings a search matches, on title, key or
 * description, ignoring case; groups left empty are dropped. An empty query
 * matches everything.
 */
export const filterSettingGroups = (
  groups: SettingGroup[],
  query: string,
): SettingGroup[] => {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return groups;
  }
  return groups
    .map((group) => ({
      ...group,
      settings: group.settings.filter((setting) =>
        [setting.title, setting.key, setting.description ?? ''].some((text) =>
          text.toLowerCase().includes(needle),
        ),
      ),
    }))
    .filter((group) => group.settings.length > 0);
};
