import { translate } from 'waldur-i18n-runtime';
import {
  OfferingOptions,
  Resource,
  ResourceApiKeyState,
  ResourceApiKeyStatus,
  SpendingLimitUsage,
} from 'waldur-js-client';

/**
 * What this app calls a service is a marketplace resource whose offering
 * serves inference: one per offering the project ordered (CBorg API for
 * this project, say). Its keys are ResourceApiKeys, its models the names in
 * the offering's `models` option. See the README.
 */

/** Alone in a model list, it stands for every model the offering lists. */
export const ALL_MODELS = '*';

type PluginOptions = {
  enable_api_key_provisioning?: boolean;
  expose_inference_playground?: boolean;
};

/** Whether an offering's plugin options make it an inference offering: it
 * has API keys or the inference view. No API filter picks these. */
export const servesInference = (pluginOptions?: unknown) => {
  const options = (pluginOptions ?? {}) as PluginOptions;
  return Boolean(
    options.enable_api_key_provisioning || options.expose_inference_playground,
  );
};

/** Whether a resource is an inference service. */
export const isInferenceService = (
  resource: Pick<Resource, 'offering_plugin_options'>,
) => servesInference(resource.offering_plugin_options);

/** The periods a key or a service may be limited by, shortest first. */
const LIMIT_PERIODS = [
  'day',
  'week',
  'month',
  'quarter',
  'year',
  'total',
] as const;

export type LimitPeriod = (typeof LIMIT_PERIODS)[number];

/** The cost component a service's spend is limited on. */
const COST_COMPONENT = 'token_cost';

export interface LimitField {
  period: LimitPeriod;
  /** The most that may be set; undefined when nothing caps it. */
  maximum?: number;
  /** What the provider suggests. */
  default?: number;
}

/**
 * The periods a new service's spend may be limited by: those the offering's
 * cost component offers, with their default and maximum.
 */
export const serviceLimitFields = (
  components?: { type: string; spending_limit_periods?: unknown }[],
): LimitField[] => {
  const periods = (components?.find((c) => c.type === COST_COMPONENT)
    ?.spending_limit_periods ?? {}) as Record<
    string,
    { default?: number | null; maximum?: number | null }
  >;
  return LIMIT_PERIODS.filter((period) => period in periods).map((period) => ({
    period,
    maximum: periods[period]?.maximum ?? undefined,
    default: periods[period]?.default ?? undefined,
  }));
};

/**
 * The periods a key may be limited by: month always, the cost component's
 * other periods when the provider reports each key's usage per day (only
 * total otherwise), each capped by the service's own limit for that period
 * or any longer one. Mirrors the portal's getResourceKeyComponents; the
 * backend has the final word.
 */
export const keyLimitFields = (
  offering: {
    plugin_options?: unknown;
    components?: { type: string; spending_limit_periods?: unknown }[];
  },
  serviceLimits?: Record<string, Record<string, number | null>> | null,
): LimitField[] => {
  const options = (offering.plugin_options ?? {}) as {
    api_key_limits?: boolean;
    api_key_daily_usage?: boolean;
  };
  if (options.api_key_limits === false) return [];
  const own = Object.keys(
    (offering.components?.find((c) => c.type === COST_COMPONENT)
      ?.spending_limit_periods ?? {}) as object,
  );
  const daily = options.api_key_daily_usage === true;
  const own_limits = serviceLimits?.[COST_COMPONENT] ?? {};
  return LIMIT_PERIODS.filter(
    (period) =>
      period === 'month' ||
      (own.includes(period) && (daily || period === 'total')),
  ).map((period) => {
    const caps = LIMIT_PERIODS.slice(LIMIT_PERIODS.indexOf(period))
      .map((longer) => own_limits[longer])
      .filter((value): value is number => typeof value === 'number');
    return { period, maximum: caps.length ? Math.min(...caps) : undefined };
  });
};

/**
 * `{token_cost: {day: 5, month: 50}}` from the form's amounts per period;
 * blank ones are left out. Undefined when none is set.
 */
export const limitsPayload = (
  amounts: Partial<Record<LimitPeriod, string>>,
): Record<string, Record<string, number>> | undefined => {
  const periods = Object.fromEntries(
    Object.entries(amounts)
      .filter(([, value]) => value != null && value.trim() !== '')
      .map(([period, value]) => [period, Number(value)]),
  );
  return Object.keys(periods).length
    ? { [COST_COMPONENT]: periods }
    : undefined;
};

/** Why an amount cannot be a limit, or undefined when it can. */
export const limitError = (value: string | undefined, maximum?: number) => {
  if (value == null || value.trim() === '') return undefined;
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) {
    return translate('Enter an amount of 0 or more.');
  }
  if (maximum != null && amount > maximum) {
    return translate('At most {maximum}.', { maximum });
  }
  return undefined;
};

/** A name for a new service: the offering's and the project's, as a slug. */
export const suggestServiceName = (offeringName: string, projectName: string) =>
  `${offeringName} ${projectName}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);

/**
 * The OpenAI-compatible base URL: a `/v1` access endpoint, the resource's
 * before the offering's (the site agent reports the exact gateway the keys
 * authenticate against on the resource). Same rule as the portal's
 * getInferenceEndpoint.
 */
export const inferenceEndpoint = (
  resource: Pick<Resource, 'endpoints'>,
  offeringEndpoints: { url?: string }[] = [],
): string | null => {
  const match = [...(resource.endpoints ?? []), ...offeringEndpoints].find(
    (endpoint) =>
      typeof endpoint?.url === 'string' &&
      endpoint.url.replace(/\/+$/, '').endsWith('/v1'),
  );
  return match ? match.url.replace(/\/+$/, '') : null;
};

/** The model names the offering lists, or null when it lists none. */
export const offeredModels = (
  resourceOptions?: Partial<OfferingOptions> | null,
): string[] | null => {
  const choices = resourceOptions?.options?.models?.choices;
  return Array.isArray(choices) ? choices : null;
};

/** The resource's own selection: every model unless it chose some. */
export const selectedModels = (options?: Record<string, unknown> | null) => {
  const value = options?.models;
  if (value == null || value === '') return [ALL_MODELS];
  if (typeof value === 'string') return [value];
  return Array.isArray(value) ? (value as string[]) : [ALL_MODELS];
};

/**
 * The models a service serves the project: its selection, read against
 * what the offering lists. Null when neither names a model (an offering
 * without a models option on every model): only the gateway knows then.
 */
export const serviceModels = (
  offered: string[] | null,
  selection: string[],
): string[] | null => {
  if (selection.includes(ALL_MODELS)) return offered;
  return offered
    ? selection.filter((name) => offered.includes(name))
    : selection;
};

/** Whether a key may call a model: its effective list names it, or all. */
export const mayCall = (
  key: Pick<ResourceApiKeyStatus, 'effective_models' | 'allowed_models'>,
  model: string,
) => {
  const models = key.effective_models ?? key.allowed_models ?? [ALL_MODELS];
  return models.includes(ALL_MODELS) || models.includes(model);
};

/** States a key passes through on its way to OK or Deleted: the list
 * refetches while one of the user's keys is in one. */
const TRANSITIONAL_KEY_STATES: ResourceApiKeyState[] = [
  'Creating',
  'Updating',
  'Deleting',
];

export const isTransitionalKey = (key: Pick<ResourceApiKeyStatus, 'state'>) =>
  TRANSITIONAL_KEY_STATES.includes(key.state);

/** What a key is called in lists: its note, else its backend ID. */
export const keyName = (
  key: Pick<ResourceApiKeyStatus, 'description' | 'client_id'>,
) => key.description?.trim() || key.client_id || undefined;

/**
 * The limit that matters most now: a reached one first, then the one most
 * used relative to its amount. Undefined when the key has none.
 */
export const headlineLimit = (
  statuses?: SpendingLimitUsage[] | null,
): SpendingLimitUsage | undefined => {
  const share = (status: SpendingLimitUsage) =>
    status.limit > 0 ? status.used / status.limit : 0;
  return [...(statuses ?? [])].sort(
    (a, b) => Number(b.reached) - Number(a.reached) || share(b) - share(a),
  )[0];
};

/** Used share of a limit, 0–100, for a bar. */
export const limitShare = (
  status: Pick<SpendingLimitUsage, 'used' | 'limit'>,
) => (status.limit > 0 ? Math.min(100, (status.used / status.limit) * 100) : 0);

/** This month's estimated cost of some keys. */
export const totalCost = (
  keys: Pick<ResourceApiKeyStatus, 'estimated_cost'>[],
) => keys.reduce((sum, key) => sum + (Number(key.estimated_cost) || 0), 0);
