import {
  OfferingTemplate,
  OfferingTemplateCreateOfferingRequest,
  OfferingTemplateParameter,
} from 'waldur-js-client';

import { getErrorBody } from '@/core/ErrorMessageFormatter';
import { translate } from '@/i18n';
import {
  AGENT_ROLE_FIELDS,
  AgentRoleField,
  flattenErrors,
} from '@/marketplace/offerings/update/integration/agentConfiguration';

import { CreateFromTemplateFormData } from './types';

// PARAMETER_VALUE_MAX_LENGTH in mastermind's offering_templates.
const VALUE_MAX_LENGTH = 1000;

const isBlank = (value: unknown) =>
  value === undefined || value === null || value === '';

// The server matches a pattern against the whole value (re.fullmatch). A
// pattern this browser cannot compile is left to the server.
const fullMatcher = (pattern: string): RegExp | undefined => {
  try {
    return new RegExp(`^(?:${pattern})$`, 'u');
  } catch {
    return undefined;
  }
};

/**
 * Why a value does not fit its parameter's declaration, as the server would
 * refuse it (_value_problem in mastermind's offering_templates), or nothing.
 * Checked before Next, so the dry run is not the first to say so.
 */
export const checkParameterValue = (
  parameter: OfferingTemplateParameter,
  value: unknown,
): string | undefined => {
  if (isBlank(value)) {
    return parameter.required
      ? translate('This field is required.')
      : undefined;
  }
  switch (parameter.type) {
    case 'integer':
      if (typeof value !== 'number' || !Number.isInteger(value)) {
        return translate('Enter a whole number.');
      }
      break;
    case 'number':
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        return translate('Enter a number.');
      }
      break;
    case 'boolean':
      if (typeof value !== 'boolean') {
        return translate('Expected yes or no.');
      }
      break;
    default:
      if (typeof value !== 'string') {
        return translate('Expected text.');
      }
      if (value.length > VALUE_MAX_LENGTH) {
        return translate('At most {count} characters.', {
          count: VALUE_MAX_LENGTH,
        });
      }
  }
  if (parameter.choices && !parameter.choices.includes(value as any)) {
    return translate('Choose one of: {choices}.', {
      choices: parameter.choices.join(', '),
    });
  }
  if (parameter.pattern && typeof value === 'string') {
    const matcher = fullMatcher(parameter.pattern);
    if (matcher && !matcher.test(value)) {
      return translate('Does not match the pattern {pattern}.', {
        pattern: parameter.pattern,
      });
    }
  }
  return undefined;
};

/** Each parameter's default, the value its field opens with. */
export const getParameterDefaults = (
  template: OfferingTemplate,
): Record<string, unknown> =>
  Object.fromEntries(
    template.parameters
      .map((parameter) => [
        parameter.key,
        // A switch left alone means No, which is an answer: without a value
        // a required one would count as unanswered.
        isBlank(parameter.default) && parameter.type === 'boolean'
          ? false
          : parameter.default,
      ])
      .filter(([, value]) => !isBlank(value)),
  );

/** The role backends the template names; a role it leaves out is blank.
 * Read from agent_roles, which everyone who sees the template gets: the
 * rest of its agent configuration is shown to staff only. */
export const getTemplateRoles = (
  template: OfferingTemplate,
): Record<AgentRoleField, string> =>
  Object.fromEntries(
    AGENT_ROLE_FIELDS.map(({ field }) => [
      field,
      template?.agent_roles?.[field] ?? '',
    ]),
  ) as Record<AgentRoleField, string>;

export const getTemplateCustomBackends = (
  template: OfferingTemplate,
): string[] => template?.agent_roles?.custom_backends ?? [];

/** The form's values when a template is picked: its defaults and roles. */
export const getTemplateValues = (
  template: OfferingTemplate,
): Pick<
  CreateFromTemplateFormData,
  'parameters' | 'agent_roles' | 'custom_backends' | 'backend_settings'
> => ({
  parameters: getParameterDefaults(template),
  agent_roles: getTemplateRoles(template),
  custom_backends: [],
  backend_settings: {},
});

// The request as the server takes it: backend settings are merged over the
// template's before it is checked. Not in the generated client yet.
type CreateOfferingRequest = OfferingTemplateCreateOfferingRequest & {
  backend_settings?: Record<string, unknown>;
};

/**
 * The create_offering request for the values. Only the roles that differ
 * from the template's are sent, so an unchanged role keeps exactly what the
 * template says; a blank parameter is left out, so its default applies.
 * The backend settings are those asked for: the roles step keeps only the
 * settings the chosen backends need.
 */
export const buildCreateRequest = (
  values: CreateFromTemplateFormData,
  customerUuid: string,
  dryRun: boolean,
): CreateOfferingRequest => {
  const templateRoles = getTemplateRoles(values.template);
  const changedRoles = Object.fromEntries(
    AGENT_ROLE_FIELDS.map(({ field }) => field)
      .filter(
        (field) => (values.agent_roles?.[field] ?? '') !== templateRoles[field],
      )
      .map((field) => [field, values.agent_roles?.[field] ?? '']),
  );
  const named = new Set(Object.values(changedRoles).filter(Boolean));
  const custom = (values.custom_backends ?? []).filter((name) =>
    named.has(name),
  );
  const agentRoles = {
    ...changedRoles,
    ...(custom.length ? { custom_backends: custom } : {}),
  };
  const backendSettings = Object.fromEntries(
    Object.entries(values.backend_settings ?? {}).filter(
      ([, value]) => !isBlank(value),
    ),
  );
  return {
    customer: customerUuid,
    category: values.category?.uuid,
    name: values.name?.trim(),
    parameters: Object.fromEntries(
      Object.entries(values.parameters ?? {}).filter(
        ([, value]) => !isBlank(value),
      ),
    ),
    ...(Object.keys(agentRoles).length ? { agent_roles: agentRoles } : {}),
    ...(Object.keys(backendSettings).length
      ? { backend_settings: backendSettings }
      : {}),
    dry_run: dryRun,
  };
};

/**
 * A refused create or dry run as `field: message` lines: parameter values,
 * the name, the agent configuration a chosen backend needs, or the rules'
 * errors (shown as findings instead, so left out here).
 */
export const describeCreateRefusal = (error: unknown): string[] => {
  const body = getErrorBody(error);
  if (!body) {
    return [translate('Unable to check the offering.')];
  }
  if (typeof body.detail === 'string') {
    return [body.detail];
  }
  const { findings: _findings, ...rest } = body;
  return flattenErrors(rest);
};
