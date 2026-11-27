import { AgentConfiguration } from 'waldur-js-client';

// eslint-disable-next-line waldur-custom/no-direct-client-usage -- the endpoint is not in the published SDK yet; see below
import { post } from '@/core/api';

// The import endpoint is not in the published waldur-js-client yet, so it is
// called through the generic helper with these local types. Once the SDK has
// `marketplaceProviderOfferingsImportAgentConfiguration`, call that here and
// use its generated types instead: the rest of the wizard only uses
// `importAgentConfiguration` and the types below.

export interface AgentConfigurationImportRequest {
  /** The YAML text of an agent configuration file. */
  configuration: string;
  /** Which entry of the file's `offerings` list to import. */
  offering_index?: number;
  /**
   * Values for the settings the file leaves as environment placeholders, by
   * dotted path, such as `backend_settings.api_url`.
   */
  values?: Record<string, unknown>;
  /** Component fields to update on the offering from the file. */
  apply_components?: AgentComponentField[];
  /** Create or update the periodic usage policy from the file. */
  apply_policy?: boolean;
  /**
   * The `actions` of the periodic usage policy: required when the import
   * creates it, optional (keep the current ones) when it updates it. Built by
   * `toPolicyActions` in importModel.ts, the one place that knows its shape.
   */
  policy_actions?: string[];
  dry_run: boolean;
}

export interface AgentComponentField {
  component: string;
  field: string;
}

export interface AgentConfigurationBlock {
  index: number;
  name: string;
  waldur_offering_uuid: string;
  matches_offering: boolean;
}

export interface AgentConfigurationChange {
  path: string;
  current: unknown;
  imported: unknown;
}

export interface AgentConfigurationIgnoredKey {
  path: string;
  reason: string;
}

export interface AgentComponentDifference extends AgentComponentField {
  offering: unknown;
  imported: unknown;
  /** Whether the import may update this field of the offering's component. */
  applicable: boolean;
  /** Why it may not, when it may not. */
  reason: string | null;
}

export interface AgentPolicyChange {
  field: string;
  current: unknown;
  imported: unknown;
}

/** The file's `policy_settings` against the offering's periodic usage policy. */
export interface AgentPolicyPreview {
  /** Whether the offering has such a policy; the import creates one if not. */
  exists: boolean;
  changes: AgentPolicyChange[];
  applicable: boolean;
  reason: string | null;
  /** What the policy may do when it fires. */
  action_choices: AgentPolicyActionChoice[];
  /** The policy does not exist yet, so its actions must be chosen. */
  needs_actions: boolean;
}

export interface AgentPolicyActionChoice {
  value: string;
  label: string;
}

/** A non-secret setting whose value in the file is `${placeholder}`. */
export interface AgentConfigurationUnresolved {
  path: string;
  placeholder: string;
}

export interface AgentConfigurationImport {
  offerings: AgentConfigurationBlock[];
  selected_index: number;
  agent_configuration: AgentConfiguration;
  current: AgentConfiguration;
  changes: AgentConfigurationChange[];
  dropped_secrets: string[];
  ignored: AgentConfigurationIgnoredKey[];
  component_differences: AgentComponentDifference[];
  /** Null when the file has no `policy_settings`. */
  policy: AgentPolicyPreview | null;
  /**
   * Why the proposed configuration does not validate, in update_integration's
   * `agent_configuration` error shape; empty when it does.
   */
  errors: Record<string, unknown>;
  unresolved: AgentConfigurationUnresolved[];
  applied: boolean;
}

/**
 * Reads the body of a refused request and throws it in the shape the SDK
 * client throws (its error interceptor in waldur-auth-core): the body's keys
 * spread on the error, the body whole under `data`, and the status beside
 * them, so `getErrorBody` and the error toasts read it alike.
 */
const toApiError = async (response: Response) => {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = undefined;
  }
  const details = {
    response,
    status: response.status,
    statusText: response.statusText,
    url: response.url,
  };
  return body !== null && typeof body === 'object'
    ? { ...body, data: body, ...details }
    : { body, ...details };
};

export const importAgentConfiguration = async (
  offeringUuid: string,
  body: AgentConfigurationImportRequest,
): Promise<AgentConfigurationImport> => {
  try {
    const response = await post(
      `/marketplace-provider-offerings/${offeringUuid}/import_agent_configuration/`,
      body,
    );
    return await response.json();
  } catch (error) {
    if (error instanceof Response) {
      throw await toApiError(error);
    }
    throw error;
  }
};
