import { translate } from '@/i18n';

export type CallTransferSection =
  | 'documents'
  | 'rounds'
  | 'offerings'
  | 'workflow_steps'
  | 'field_configs'
  | 'review_configs'
  | 'role_mappings'
  | 'compliance_checklist';

// Top-level keys of an export document that carry each section. Must match
// `present_sections` in the backend's proposal/call_transfer.py.
const SECTION_KEYS: Record<CallTransferSection, string[]> = {
  documents: ['documents'],
  rounds: ['rounds'],
  offerings: ['requested_offerings'],
  workflow_steps: ['workflow_steps'],
  field_configs: ['proposal_field_config', 'applicant_visibility_config'],
  review_configs: [
    'coi_configuration',
    'matching_configuration',
    'assignment_configuration',
  ],
  role_mappings: ['role_mappings'],
  compliance_checklist: ['compliance_checklist'],
};

export const CALL_TRANSFER_SECTIONS = Object.keys(
  SECTION_KEYS,
) as CallTransferSection[];

export const getSectionLabel = (section: CallTransferSection): string =>
  ({
    documents: translate('Documents'),
    rounds: translate('Rounds'),
    offerings: translate('Offerings and resource templates'),
    workflow_steps: translate('Workflow steps'),
    field_configs: translate('Proposal fields and applicant visibility'),
    review_configs: translate('COI, matching and assignment settings'),
    role_mappings: translate('Role mappings'),
    compliance_checklist: translate('Compliance checklist'),
  })[section];

export const getSectionDescription = (section: CallTransferSection): string =>
  ({
    documents: translate('Attached files, included in the export.'),
    rounds: translate('Round schedule and settings; no proposals.'),
    offerings: translate(
      'Requested offerings, matched by offering and provider name on import.',
    ),
    workflow_steps: translate(
      'Evaluation steps with their notification rules and criteria.',
    ),
    field_configs: translate(
      'Which proposal fields are collected and which applicant details are shown.',
    ),
    review_configs: translate(
      'Conflict-of-interest, reviewer matching and assignment settings.',
    ),
    role_mappings: translate(
      'Proposal-to-project role mappings, matched by role name.',
    ),
    compliance_checklist: translate('Matched by checklist name on import.'),
  })[section];

// An exported section can be present but empty -- a call without rounds
// exports `rounds: []` -- and there is nothing to choose about importing it.
const hasContent = (value: unknown): boolean =>
  Array.isArray(value)
    ? value.length > 0
    : value !== null && value !== undefined;

export const getPresentSections = (
  data: Record<string, unknown>,
): CallTransferSection[] =>
  CALL_TRANSFER_SECTIONS.filter((section) =>
    SECTION_KEYS[section].some((key) => hasContent(data[key])),
  );

export const sectionFlags = <P extends string>(
  prefix: P,
  selected: Partial<Record<CallTransferSection, boolean>>,
): Record<`${P}${CallTransferSection}`, boolean> =>
  Object.fromEntries(
    CALL_TRANSFER_SECTIONS.map((section) => [
      `${prefix}${section}`,
      Boolean(selected[section]),
    ]),
  ) as Record<`${P}${CallTransferSection}`, boolean>;
