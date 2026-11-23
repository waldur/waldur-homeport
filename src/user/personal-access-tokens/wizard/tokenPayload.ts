import type {
  DedicatedUserTokenCreateRequest,
  PatTemplate,
  PatTemplateTarget,
  PersonalAccessTokenCreateRequest,
} from 'waldur-js-client';

import type { ProgressStep } from 'waldur-ui';

import { translate } from '@/i18n';

import { GLOBAL_SCOPES } from '../scopeOptions';

export const CUSTOM_PURPOSE = 'custom';

/** A new dedicated user holding only the target's manager role, or the
 * person creating the token. */
export type TokenFor = 'agent_user' | 'me';

export const SITE_AGENT_TEMPLATE = 'site_agent';

export interface BindingRow {
  type: string | null;
  // The full entity object kept around for displaying the chosen item; only
  // the uuid is sent to the API.
  entity: { uuid: string; name: string } | null;
}

export interface TokenWizardValues {
  /** A template key, or CUSTOM_PURPOSE. */
  purpose?: string;
  /** Template mode: the one entity the token is bound to. */
  target?: PatTemplateTarget | null;
  /** Template mode: keys of the optional features switched on. */
  features: string[];
  /** Custom mode: the permissions picked one by one. */
  scopes: string[];
  /** Custom mode: free entity bindings. */
  allowed_scopes: BindingRow[];
  name: string;
  /** The last name the wizard made up; the name is the user's once it differs. */
  generatedName?: string;
  expires_at: string;
  allowed_networks?: string;
  /** Staff on a template target: who the token is for. */
  tokenFor?: TokenFor;
  /** The dedicated user's username; derived from the target when empty. */
  agentUsername?: string;
  /** The step on screen, so that validation knows which answers are due. */
  step?: TokenWizardStepKey;
}

export type TokenWizardStepKey =
  'purpose' | 'target' | 'permissions' | 'limits' | 'review';

/**
 * The steps the wizard shows. Purpose is left out when Custom is the only
 * choice, and Purpose and Target both when the caller already chose them
 * (the offering's "Create agent token").
 */
export const getTokenWizardSteps = ({
  hasTemplates,
  preset,
}: {
  hasTemplates: boolean;
  preset: boolean;
}): ProgressStep[] => {
  const all: Record<TokenWizardStepKey, string> = {
    purpose: translate('Purpose'),
    target: translate('Target'),
    permissions: translate('Permissions'),
    limits: translate('Limits'),
    review: translate('Review'),
  };
  const keys: TokenWizardStepKey[] = preset
    ? ['permissions', 'limits', 'review']
    : hasTemplates
      ? ['purpose', 'target', 'permissions', 'limits', 'review']
      : ['target', 'permissions', 'limits', 'review'];
  return keys.map((key) => ({ key, label: all[key], completed: false }));
};

/** The scopes a template's token gets on a target: the required ones, plus
 * those of each switched-on feature the user can grant there. */
export const getTemplateScopes = (
  template: PatTemplate,
  target: PatTemplateTarget | null | undefined,
  features: readonly string[],
  staffAccess = !!target?.staff_access,
): string[] => {
  const grantable = new Set(target?.features ?? []);
  const scopes = new Set(template.required_scopes);
  for (const feature of template.optional_features) {
    if (features.includes(feature.key) && grantable.has(feature.key)) {
      for (const scope of feature.scopes) scopes.add(scope);
    }
  }
  // A staff user without a role on the target acts through staff access,
  // which only a token carrying STAFF.ACCESS can use.
  if (staffAccess) scopes.add(STAFF_ACCESS);
  return Array.from(scopes);
};

export const STAFF_ACCESS = 'STAFF.ACCESS';

export const parseNetworks = (value?: string): string[] =>
  (value ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

export const hasGlobalScope = (scopes: readonly string[]): boolean =>
  scopes.some((scope) => GLOBAL_SCOPES.has(scope));

/** The bindings a custom token is sent with: the complete rows, exactly. */
export const getCustomBindings = (
  values: Pick<TokenWizardValues, 'allowed_scopes'>,
): { type: string; uuid: string }[] =>
  (values.allowed_scopes ?? [])
    .filter((row) => row.type && row.entity?.uuid)
    .map((row) => ({ type: row.type as string, uuid: row.entity!.uuid }));

/**
 * Where a template's token is bound: exactly the bindings the backend lists
 * for the target. A staff-access target has none: STAFF.ACCESS cannot be
 * combined with bindings, so that token is unrestricted, which the wizard
 * warns about. Otherwise the target's own type and uuid are used only from a
 * backend that lists no bindings, so the list is never empty.
 */
const getTargetBindings = (
  target: PatTemplateTarget | null | undefined,
): { type: string; uuid: string }[] => {
  if (!target || target.staff_access) return [];
  return target.bindings?.length
    ? target.bindings.map(({ type, uuid }) => ({ type, uuid }))
    : [{ type: target.type, uuid: target.uuid }];
};

/** The create request for the wizard's values. A template's token is bound to
 * exactly the chosen target, never anywhere else. */
export const buildTokenPayload = (
  values: TokenWizardValues,
  template?: PatTemplate,
): PersonalAccessTokenCreateRequest => {
  const common = {
    name: values.name,
    expires_at: values.expires_at,
    allowed_networks: parseNetworks(values.allowed_networks),
  };
  if (template) {
    const target = values.target;
    const allowedScopes = getTargetBindings(target);
    // An empty list leaves the token unrestricted: only ever for staff
    // access, and never without a target.
    if (!target || (allowedScopes.length === 0 && !target.staff_access)) {
      throw new Error(translate('Choose where the token is used.'));
    }
    return {
      ...common,
      scopes: getTemplateScopes(template, target, values.features ?? []),
      allowed_scopes: allowedScopes,
    };
  }
  const allowedScopes = getCustomBindings(values);
  // The backend refuses the two together; never send one without the other
  // behind the user's back.
  if (hasGlobalScope(values.scopes ?? []) && allowedScopes.length > 0) {
    throw new Error(
      translate(
        'Global staff or support access cannot be combined with entity restrictions.',
      ),
    );
  }
  return {
    ...common,
    scopes: values.scopes ?? [],
    allowed_scopes: allowedScopes,
  };
};

const STEP_ORDER: TokenWizardStepKey[] = [
  'purpose',
  'target',
  'permissions',
  'limits',
  'review',
];

/** Custom bindings whose type none of the chosen permissions can be bound to,
 * which the backend would refuse. */
const getUnfitBindings = (
  values: Pick<TokenWizardValues, 'scopes' | 'allowed_scopes'>,
  bindingTargets: Record<string, readonly string[]>,
): BindingRow[] => {
  const bindable = new Set(
    (values.scopes ?? []).flatMap((scope) => bindingTargets[scope] ?? []),
  );
  return (values.allowed_scopes ?? []).filter(
    (row) => row.type && row.entity?.uuid && !bindable.has(row.type),
  );
};

/**
 * Form-level validation: unlike a field's own validator it holds while the
 * field is not on screen, so the step indicator cannot skip past a step
 * whose answer a later change has cleared. An answer is due once the wizard
 * is on or past its step.
 */
/**
 * The wizard's form-level errors. A problem with the restriction rows goes
 * under ``restrictions``, a key no field has: written to ``allowed_scopes``, a
 * string would sit where final-form-arrays keeps the rows' own errors, and
 * final-form then fails to set a row's value ("Cannot set a numeric property
 * on an object").
 */
export type TokenWizardErrors = Partial<
  Record<keyof TokenWizardValues | 'restrictions', string>
>;

export const validateTokenWizard = (
  values: TokenWizardValues,
  templates: readonly PatTemplate[],
  bindingTargets: Record<string, readonly string[]>,
  describeBinding: (row: BindingRow) => string,
): TokenWizardErrors => {
  const errors: TokenWizardErrors = {};
  const current = STEP_ORDER.indexOf(values.step ?? 'purpose');
  const reached = (step: TokenWizardStepKey) =>
    current >= STEP_ORDER.indexOf(step);
  if (!values.purpose) {
    if (reached('purpose')) errors.purpose = translate('Choose a purpose.');
    return errors;
  }
  if (reached('limits')) {
    if (!values.name?.trim()) errors.name = translate('Name the token.');
    if (!values.expires_at) {
      errors.expires_at = translate('Choose when the token expires.');
    }
  }
  const template = templates.find((t) => t.key === values.purpose);
  if (template) {
    if (
      reached('target') &&
      (!values.target ||
        (getTargetBindings(values.target).length === 0 &&
          !values.target.staff_access))
    ) {
      errors.target = translate('Choose where the token is used.');
    }
    return errors;
  }
  const rows = values.allowed_scopes ?? [];
  if (reached('target') && rows.some((row) => !row.type || !row.entity?.uuid)) {
    errors.restrictions = translate(
      'Choose a type and an entity for every restriction, or remove it.',
    );
  } else if (reached('permissions')) {
    if (!values.scopes?.length) {
      errors.scopes = translate('Select at least one permission.');
    } else if (hasGlobalScope(values.scopes) && rows.length > 0) {
      errors.restrictions = translate(
        'Global staff or support access cannot be combined with entity restrictions. Remove the restrictions in the Target step, or clear the global access.',
      );
    } else {
      const unfit = getUnfitBindings(values, bindingTargets);
      if (unfit.length > 0) {
        errors.restrictions = translate(
          'None of the selected permissions can be restricted to {bindings}. Choose a permission that applies there, or remove the restriction in the Target step.',
          { bindings: unfit.map(describeBinding).join(', ') },
        );
      }
    }
  }
  return errors;
};

/** Whether the name is still one the wizard made up (or none), which a new
 * purpose or target may replace; a name the user typed is never replaced. */
export const isGeneratedName = (
  values: Pick<TokenWizardValues, 'name' | 'generatedName'>,
): boolean => !values.name || values.name === values.generatedName;

/** An ISO date `days` days from `today`. */
export const getDefaultExpiry = (days: number, today = new Date()): string => {
  const date = new Date(today);
  date.setDate(date.getDate() + days);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

/** Whether staff can choose a dedicated user for this template's target. */
export const canUseDedicatedUser = (
  template: PatTemplate | undefined,
  target: PatTemplateTarget | null | undefined,
  isStaff: boolean,
): boolean =>
  isStaff &&
  !!template &&
  !!target &&
  (template.dedicated_user_types ?? []).includes(target.type);

/**
 * Who the token is for. A dedicated user is the default where the alternative
 * is full staff access, and "me" where the staff user holds a role there.
 */
export const getTokenFor = (
  values: Pick<TokenWizardValues, 'tokenFor' | 'target'>,
  template: PatTemplate | undefined,
  isStaff: boolean,
): TokenFor => {
  if (!canUseDedicatedUser(template, values.target, isStaff)) return 'me';
  return values.tokenFor ?? (values.target?.staff_access ? 'agent_user' : 'me');
};

/** The agent_user request: a new user with the target's manager role, and a
 * token for it bound to the target. */
export const buildAgentUserPayload = (
  values: TokenWizardValues,
  template: PatTemplate,
): DedicatedUserTokenCreateRequest => {
  const target = values.target;
  if (!target) {
    throw new Error(translate('Choose where the token is used.'));
  }
  const grantable = new Set(target.features ?? []);
  const username = values.agentUsername?.trim();
  return {
    template: template.key,
    target_type: target.type,
    target_uuid: target.uuid,
    ...(username ? { username } : {}),
    features: (values.features ?? []).filter((key) => grantable.has(key)),
    name: values.name,
    expires_at: values.expires_at,
    allowed_networks: parseNetworks(values.allowed_networks),
  };
};
