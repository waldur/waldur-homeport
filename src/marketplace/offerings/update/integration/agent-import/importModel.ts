import * as yaml from 'js-yaml';
import { AgentPlugin } from 'waldur-js-client';

import { getErrorBody } from '@/core/ErrorMessageFormatter';
import { translate } from '@/i18n';

import {
  AGENT_SWITCH_DEFAULTS,
  describeRefusal,
  flattenErrors,
} from '../agentConfiguration';
import {
  getBackendsInUse,
  getPluginSettings,
  groupSettingsByBackend,
  SettingKind,
  toSettingValue,
} from '../backendSettingsSchema';

import {
  AgentComponentDifference,
  AgentComponentField,
  AgentConfigurationBlock,
  AgentConfigurationIgnoredKey,
  AgentConfigurationImportRequest,
  AgentConfigurationUnresolved,
} from './api';

/**
 * The preview's components, each shown once: a component the offering lacks
 * is listed among the ignored keys (`backend_components.<type>`) and has a
 * difference for every field the file gives it. It is shown as one missing
 * component instead, and left out of both lists.
 */
export const splitMissingComponents = (
  differences: AgentComponentDifference[],
  ignored: AgentConfigurationIgnoredKey[],
): {
  missing: string[];
  differences: AgentComponentDifference[];
  ignored: AgentConfigurationIgnoredKey[];
} => {
  const differing = new Set(differences.map(({ component }) => component));
  const missing = ignored
    .map(({ path }) => /^backend_components\.([^.]+)$/.exec(path)?.[1])
    .filter((component) => component && differing.has(component));
  const isMissing = new Set(missing);
  return {
    missing,
    differences: differences.filter(
      ({ component }) => !isMissing.has(component),
    ),
    ignored: ignored.filter(
      ({ path }) =>
        !isMissing.has(/^backend_components\.([^.]+)$/.exec(path)?.[1]),
    ),
  };
};

/** The longest configuration the server takes, in characters. */
export const MAX_CONFIGURATION_LENGTH = 512 * 1024;

export const getTooLongMessage = () =>
  translate('The configuration must be smaller than 512 KiB.');

/** Why the text cannot be sent as it is, if it cannot. */
export const getConfigurationErrors = (configuration: string): string[] =>
  configuration.length > MAX_CONFIGURATION_LENGTH ? [getTooLongMessage()] : [];

/** Why the server refused an import, sorted by where the wizard shows it. */
export interface ImportRefusal {
  /** The file itself: unparseable, or no `offerings` list. */
  configuration: string[];
  /** Which block to import: the file has several and none matches. */
  offeringIndex: string[];
  /** The imported configuration, as `path: message` lines. */
  validation: string[];
  /** The blocks of the file, sent along with a request to choose one. */
  offerings?: AgentConfigurationBlock[];
}

const toLines = (value: unknown): string[] =>
  value === undefined ? [] : flattenErrors(value);

// The settings of the event and agent blocks, with the types their
// serializers declare; the agent's switches are all booleans.
/** A placeholder setting's type, and the choices of an enum. */
export interface PlaceholderType {
  kind: SettingKind;
  options?: (string | number)[];
}

const BLOCK_SETTING_KINDS: Record<string, SettingKind> = {
  'event_settings.stomp_enabled': 'boolean',
  'event_settings.stomp_membership_sync_enabled': 'boolean',
  'event_settings.websocket_use_tls': 'boolean',
  'event_settings.stomp_ws_port': 'integer',
  'event_settings.stomp_ws_host': 'string',
  'event_settings.stomp_ws_path': 'string',
  ...Object.fromEntries(
    Object.keys(AGENT_SWITCH_DEFAULTS.agent_settings).map((key) => [
      `agent_settings.${key}`,
      'boolean' as SettingKind,
    ]),
  ),
};

/**
 * What a placeholder setting holds, where it is known: a backend setting as
 * the plugin catalogue's schema describes it (for the backends the proposed
 * configuration runs, else any backend declaring it), an event or agent
 * setting as its serializer does. A setting inside a block of the backend
 * settings, or one nothing declares, is unknown.
 */
export const getPlaceholderType = (
  path: string,
  plugins: AgentPlugin[] | undefined,
  configuration: Record<string, any> | undefined,
): PlaceholderType | undefined => {
  if (path in BLOCK_SETTING_KINDS) {
    return { kind: BLOCK_SETTING_KINDS[path] };
  }
  const [block, key, ...rest] = path.split('.');
  if (block !== 'backend_settings' || !key || rest.length) {
    return undefined;
  }
  const inUse = groupSettingsByBackend(
    getBackendsInUse(configuration ?? {}),
    plugins,
  ).flatMap(({ settings }) => settings);
  const setting =
    inUse.find((item) => item.key === key) ??
    (plugins ?? [])
      .flatMap((plugin) =>
        plugin.settings_schema ? getPluginSettings(plugin) : [],
      )
      .find((item) => item.key === key);
  return setting ? { kind: setting.kind, options: setting.options } : undefined;
};

/**
 * A typed value as the API takes it: a switch as a boolean, a number as a
 * number, JSON parsed. A value of a setting of unknown type is parsed as
 * JSON when it is JSON (true, 42, a list or an object), else sent as typed.
 */
const toPlaceholderValue = (
  type: PlaceholderType | undefined,
  text: string,
): unknown => {
  const kind = type?.kind;
  if (kind === 'boolean') {
    return text === 'true';
  }
  if (kind === 'string') {
    return text;
  }
  if (kind === 'enum') {
    // The option itself, with its own type: a numeric choice is a number.
    return type.options?.find((option) => String(option) === text) ?? text;
  }
  if (kind === 'integer' || kind === 'number' || kind === 'json') {
    return toSettingValue(
      { key: '', backend: '', title: '', kind, required: false },
      text,
    );
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

/**
 * The values to send for the settings asked for, each with its setting's
 * type, without the blank ones. A switch left off is sent as false.
 */
export const getSentValues = (
  values: Record<string, string>,
  asked: AgentConfigurationUnresolved[],
  types: Record<string, PlaceholderType | undefined>,
): Record<string, unknown> =>
  Object.fromEntries(
    asked.flatMap(({ path }) => {
      const type = types[path];
      const text =
        type?.kind === 'boolean'
          ? (values[path] ?? 'false')
          : values[path]?.trim();
      return text ? [[path, toPlaceholderValue(type, text)]] : [];
    }),
  );

/** What a request sends besides the file, the block and `dry_run`. */
export type ImportOptions = Pick<
  AgentConfigurationImportRequest,
  'values' | 'apply_components' | 'apply_policy' | 'policy_actions'
>;

/**
 * The policy's actions as the request takes them: a list of values. Were
 * it a single value, this would send `actions[0]`.
 */
const toPolicyActions = (
  actions: string[],
): AgentConfigurationImportRequest['policy_actions'] => actions;

/** The errors about the policy's actions, from a preview or a refusal. */
export const getPolicyActionErrors = (errors: unknown): string[] => {
  const actions = (errors as any)?.policy?.actions;
  return actions === undefined ? [] : flattenErrors(actions);
};

/**
 * The options as sent: each only when it asks for something, so a request
 * without values or choices is the plain one.
 */
export const getImportOptions = (
  values: Record<string, unknown>,
  applyComponents: AgentComponentField[],
  applyPolicy: boolean,
  policyActions: string[],
): ImportOptions => ({
  ...(Object.keys(values).length ? { values } : {}),
  // In one order, so the same choices made in another order are the same.
  ...(applyComponents.length
    ? {
        apply_components: [...applyComponents].sort(
          (a, b) =>
            a.component.localeCompare(b.component) ||
            a.field.localeCompare(b.field),
        ),
      }
    : {}),
  ...(applyPolicy ? { apply_policy: true } : {}),
  ...(applyPolicy && policyActions.length
    ? { policy_actions: toPolicyActions(policyActions) }
    : {}),
});

export const isSameComponentField = (
  a: AgentComponentField,
  b: AgentComponentField,
) => a.component === b.component && a.field === b.field;

/** The placeholder settings asked for so far, with those of a new preview. */
export const mergeUnresolved = (
  current: AgentConfigurationUnresolved[],
  next: AgentConfigurationUnresolved[] | undefined,
): AgentConfigurationUnresolved[] => {
  const added = (next ?? []).filter(
    ({ path }) => !current.some((item) => item.path === path),
  );
  return added.length ? [...current, ...added] : current;
};

/** The errors of a previewed configuration, as `path: message` lines. */
export const describePreviewErrors = (
  errors: Record<string, unknown> | undefined,
): string[] => flattenErrors(errors ?? {});

/**
 * What a refused import says, or nothing when it is not a refusal to show in
 * the wizard (a server error, a lost connection), which is then a
 * notification.
 */
export const describeImportRefusal = (
  error: any,
): ImportRefusal | undefined => {
  const status = error?.status ?? error?.response?.status;
  if (status === 403) {
    return {
      configuration: [],
      offeringIndex: [],
      validation: describeRefusal(error, '')?.errors ?? [],
    };
  }
  const body = getErrorBody(error);
  if (status !== 400 || !body) {
    return undefined;
  }
  const {
    configuration,
    offering_index,
    agent_configuration,
    detail,
    offerings,
    ...rest
  } = body;
  return {
    offerings: Array.isArray(offerings) ? offerings : undefined,
    configuration: toLines(configuration),
    offeringIndex: toLines(offering_index),
    validation: [
      ...toLines(agent_configuration),
      ...(typeof detail === 'string' ? [detail] : []),
      ...flattenErrors(rest),
    ],
  };
};

const normalizeUuid = (value: unknown) =>
  typeof value === 'string' ? value.replace(/-/g, '').toLowerCase() : '';

/**
 * The offering blocks of an agent configuration file, read here when the
 * server refused the dry run without listing them: it asked which block to
 * import, or the selected one does not validate. An unreadable file has none.
 */
export const listConfigurationBlocks = (
  configuration: string,
  offeringUuid: string,
): AgentConfigurationBlock[] => {
  let parsed: unknown;
  try {
    parsed = yaml.load(configuration);
  } catch {
    return [];
  }
  const offerings = (parsed as { offerings?: unknown })?.offerings;
  if (!Array.isArray(offerings)) {
    return [];
  }
  return offerings.map((block, index) => {
    const uuid = block?.waldur_offering_uuid;
    return {
      index,
      name:
        typeof block?.name === 'string' && block.name
          ? block.name
          : translate('Block {number}', { number: index + 1 }),
      waldur_offering_uuid: typeof uuid === 'string' ? uuid : '',
      matches_offering:
        Boolean(uuid) && normalizeUuid(uuid) === normalizeUuid(offeringUuid),
    };
  });
};

/** The block to start from: the one for this offering, else the first. */
export const getDefaultBlockIndex = (
  blocks: AgentConfigurationBlock[],
): number | undefined =>
  (blocks.find((block) => block.matches_offering) ?? blocks[0])?.index;
