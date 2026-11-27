import {
  AgentComponentFieldEnum,
  AgentConfigurationChange,
  AgentConfigurationImportRequest,
  AgentConfigurationImportResult,
  ApplyComponentRequest,
  ComponentDifference,
  IgnoredKey,
  ImportedOfferingBlock,
  ImportedPolicy,
  marketplaceProviderOfferingsImportAgentConfiguration,
  PolicyActionChoice,
  PolicyChange,
  UnresolvedSetting,
} from 'waldur-js-client';

// The wizard's names for the generated types: the rest of the wizard imports
// them from here, so this module is its one link to the SDK.
export type { AgentConfigurationChange, AgentConfigurationImportRequest };
export type AgentConfigurationImport = AgentConfigurationImportResult;
export type AgentComponentField = ApplyComponentRequest;
export type AgentConfigurationBlock = ImportedOfferingBlock;
export type AgentConfigurationIgnoredKey = IgnoredKey;
export type AgentComponentDifference = ComponentDifference;
/** The file's `policy_settings` against the offering's periodic usage policy. */
export type AgentPolicyPreview = ImportedPolicy;
export type AgentPolicyChange = PolicyChange;
export type AgentPolicyActionChoice = PolicyActionChoice;

/** The field of a component difference as the import takes it back: the
 * schema types the difference's field as a string, though it is always one
 * of the compared fields. */
export const toComponentField = ({
  component,
  field,
}: Pick<ComponentDifference, 'component' | 'field'>): AgentComponentField => ({
  component,
  field: field as AgentComponentFieldEnum,
});
/** A non-secret setting whose value in the file is `${placeholder}`. */
export type AgentConfigurationUnresolved = UnresolvedSetting;

export const importAgentConfiguration = (
  offeringUuid: string,
  body: AgentConfigurationImportRequest,
): Promise<AgentConfigurationImport> =>
  marketplaceProviderOfferingsImportAgentConfiguration({
    path: { uuid: offeringUuid },
    body,
  }).then((response) => response.data);
