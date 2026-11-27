import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  AgentPlugin,
  marketplaceSiteAgentPluginsList,
  OfferingTemplate,
} from 'waldur-js-client';

import { UI_STALE_TIME } from '@/core/constants';
import { translate } from '@/i18n';
import {
  AGENT_ROLE_FIELDS,
  AgentRoleField,
} from '@/marketplace/offerings/update/integration/agentConfiguration';

import { getTemplateRoles } from './utils';

type SettingKind = 'string' | 'integer' | 'number' | 'boolean';

/** A required backend setting the wizard asks for: one a chosen backend
 * declares required, that is not a secret, and that the template neither
 * sets nor fills from a parameter. */
export interface AskedSetting {
  key: string;
  backend: string;
  title: string;
  description?: string;
  kind: SettingKind;
  choices?: (string | number | boolean)[];
  default?: unknown;
}

export interface AskedBackend {
  backend: string;
  settings: AskedSetting[];
}

type SchemaNode = Record<string, any>;

const PARAMETER_PATH_PREFIX = 'agent_configuration.backend_settings.';

const isBlankSetting = (value: unknown) =>
  value === undefined || value === null || value === '';

/** The plugin catalogue; one query for every step that reads it. */
export const useSiteAgentPlugins = () =>
  useQuery({
    queryKey: ['site-agent-plugins'],
    queryFn: () =>
      marketplaceSiteAgentPluginsList().then((response) => response.data),
    refetchOnWindowFocus: false,
    staleTime: UI_STALE_TIME,
  });

// A "$ref" into the schema's own definitions, and a lone "allOf" wrapping
// one, as pydantic writes a property whose type is a model or an enum.
const resolveRef = (schema: SchemaNode, node: SchemaNode): SchemaNode => {
  if (node?.allOf?.length === 1) {
    return resolveRef(schema, { ...node, ...node.allOf[0], allOf: undefined });
  }
  const ref: unknown = node?.$ref;
  if (typeof ref !== 'string') {
    return node;
  }
  const name = ref.split('/').pop();
  const target = schema.$defs?.[name] ?? schema.definitions?.[name];
  return target ? { ...target, ...node, $ref: undefined } : node;
};

// The setting's input: an optional value (anyOf with null) is its non-null
// type; a union of several types, an object or a list is not asked for.
const resolveKind = (
  schema: SchemaNode,
  property: SchemaNode,
): Pick<AskedSetting, 'kind' | 'choices'> | undefined => {
  let node = resolveRef(schema, property);
  const variants = node.anyOf ?? node.oneOf;
  if (Array.isArray(variants)) {
    const nonNull = variants
      .map((variant: SchemaNode) => resolveRef(schema, variant))
      .filter((variant: SchemaNode) => variant.type !== 'null');
    if (nonNull.length !== 1) {
      return undefined;
    }
    node = { ...node, ...nonNull[0], anyOf: undefined, oneOf: undefined };
  }
  let type = node.type;
  if (Array.isArray(type)) {
    const nonNull = type.filter((item) => item !== 'null');
    type = nonNull.length === 1 ? nonNull[0] : undefined;
  }
  const choices = Array.isArray(node.enum)
    ? node.enum.filter((choice: unknown) => choice !== null)
    : undefined;
  if (!type && choices?.length) {
    type = typeof choices[0] === 'number' ? 'number' : 'string';
  }
  if (!['string', 'integer', 'number', 'boolean'].includes(type)) {
    return undefined;
  }
  return { kind: type, ...(choices?.length ? { choices } : {}) };
};

const isSecret = (
  plugin: AgentPlugin,
  schema: SchemaNode,
  key: string,
  property: SchemaNode,
) =>
  property.secret === true ||
  resolveRef(schema, property).secret === true ||
  (plugin.secret_settings ?? []).some(
    (path) => path === key || path.startsWith(`${key}.`),
  );

/** Whether the template sets the setting: in its own backend settings,
 * which only staff can read, or through one of its parameters. */
const isSetByTemplate = (template: OfferingTemplate, key: string) => {
  const settings = (template?.document as any)?.agent_configuration
    ?.backend_settings;
  if (settings && !isBlankSetting(settings[key])) {
    return true;
  }
  const path = `${PARAMETER_PATH_PREFIX}${key}`;
  return (template?.parameters ?? []).some((parameter) =>
    (parameter.paths ?? []).some(
      (item) => item === path || item.startsWith(`${path}.`),
    ),
  );
};

/**
 * The settings to ask for, by backend, in the order of the roles that use
 * them. A backend one of the template's own roles runs is configured by the
 * template, so nothing is asked for it, nor for a setting it requires: the
 * template's backend settings, which only staff can read, already hold it.
 * Backend settings are one mapping, so a setting two backends need is asked
 * once, under the first.
 */
export const getAskedBackendSettings = (
  plugins: AgentPlugin[],
  roles: Partial<Record<AgentRoleField, string>>,
  template: OfferingTemplate,
): AskedBackend[] => {
  const backends = [
    ...new Set(
      AGENT_ROLE_FIELDS.map(({ field }) => roles?.[field]).filter(Boolean),
    ),
  ];
  const templateBackends = new Set(
    Object.values(getTemplateRoles(template)).filter(Boolean),
  );
  // Settings the template's backends require count as set by it.
  const seen = new Set<string>(
    plugins
      .filter((plugin) => templateBackends.has(plugin.name))
      .flatMap(
        (plugin) =>
          ((plugin.settings_schema as SchemaNode | null)?.required ??
            []) as string[],
      ),
  );
  const result: AskedBackend[] = [];
  for (const backend of backends) {
    const plugin = plugins.find((item) => item.name === backend);
    const schema = plugin?.settings_schema as SchemaNode | null;
    if (!schema || templateBackends.has(backend)) {
      continue;
    }
    const settings: AskedSetting[] = [];
    for (const key of (schema.required ?? []) as string[]) {
      const property = schema.properties?.[key] as SchemaNode | undefined;
      if (
        seen.has(key) ||
        !property ||
        isSecret(plugin, schema, key, property) ||
        isSetByTemplate(template, key)
      ) {
        continue;
      }
      const kind = resolveKind(schema, property);
      if (!kind) {
        continue;
      }
      seen.add(key);
      settings.push({
        key,
        backend,
        title: property.title || resolveRef(schema, property).title || key,
        description: property.description,
        default: property.default,
        ...kind,
      });
    }
    if (settings.length) {
      result.push({ backend, settings });
    }
  }
  return result;
};

/** The asked settings' values: what was entered, else the schema default;
 * a setting no longer asked for is dropped. */
export const getBackendSettingValues = (
  asked: AskedBackend[],
  current: Record<string, unknown> | undefined,
): Record<string, unknown> =>
  Object.fromEntries(
    asked
      .flatMap(({ settings }) => settings)
      .map((setting) => {
        const value = current?.[setting.key];
        if (!isBlankSetting(value)) {
          return [setting.key, value];
        }
        // A switch left alone means No, which is an answer.
        return [
          setting.key,
          isBlankSetting(setting.default) && setting.kind === 'boolean'
            ? false
            : setting.default,
        ];
      })
      .filter(([, value]) => !isBlankSetting(value)),
  );

export const checkBackendSetting = (
  setting: AskedSetting,
  value: unknown,
): string | undefined => {
  if (isBlankSetting(value)) {
    return translate('This field is required.');
  }
  if (setting.kind === 'integer') {
    if (typeof value !== 'number' || !Number.isInteger(value)) {
      return translate('Enter a whole number.');
    }
  } else if (setting.kind === 'number') {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return translate('Enter a number.');
    }
  }
  return undefined;
};

/** The asked settings for the form's roles, once the catalogue is in. */
export const useAskedBackendSettings = (
  plugins: AgentPlugin[] | undefined,
  roles: Partial<Record<AgentRoleField, string>> | undefined,
  template: OfferingTemplate | undefined,
) => {
  // The roles' contents, not their identity.
  const rolesKey = JSON.stringify(roles ?? {});
  return useMemo(
    () =>
      plugins ? getAskedBackendSettings(plugins, roles ?? {}, template) : [],
    [plugins, rolesKey, template],
  );
};
