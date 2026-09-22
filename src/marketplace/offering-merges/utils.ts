import {
  InvoicePolicyEnum,
  OfferingMerge,
  OfferingMergeEntry,
  OfferingMergeIssue,
  OfferingMergePreview,
  OfferingMergeStateEnum,
  OfferingMergeSuggestedMapping,
  PatchedOfferingMergeRequest,
} from 'waldur-js-client';

import { translate } from '@/i18n';

import {
  ACTIVE_STATES,
  CROSS_TYPE_MERGEABLE_TYPES,
  EDITABLE_STATES,
  JOURNALLED_STATES,
  KEPT_ON_SOURCE_EFFECT,
  POLL_INTERVAL,
  PREVIEWABLE_STATES,
} from './constants';

type ComponentMapping = Record<string, Record<string, string>>;

/** The editable part of a merge record, as the wizard holds it. */
export interface MergeDraft {
  plan_mapping: Record<string, string>;
  component_mapping: ComponentMapping;
  attribute_key_mapping: Record<string, string>;
  invoice_policy: InvoicePolicyEnum;
}

interface OfferingOptionsLike {
  options?: { options?: Record<string, unknown> } | null;
}

/**
 * Offering types a merge may combine with the ones already chosen. Offerings
 * without a backend scope (Basic, Support, site agent) merge in any direction
 * between themselves; any other type merges only into itself. Returns
 * undefined while nothing is chosen, meaning every type is still possible.
 */
export const getAllowedOfferingTypes = (
  chosenTypes: string[],
): string[] | undefined => {
  const types = Array.from(new Set(chosenTypes.filter(Boolean)));
  if (types.length === 0) {
    return undefined;
  }
  if (types.every((type) => CROSS_TYPE_MERGEABLE_TYPES.includes(type))) {
    return [...CROSS_TYPE_MERGEABLE_TYPES];
  }
  // A scoped type merges only into itself, so every choice must share it.
  return types.length === 1 ? types : [];
};

/**
 * Pre-fill the plan and component mappings from the backend's suggestion.
 * Whatever the record already maps wins: suggestions only fill the gaps, so
 * re-applying them never overwrites a choice staff made by hand.
 */
export const prefillMappings = (
  suggestion: OfferingMergeSuggestedMapping | undefined,
  current: Pick<MergeDraft, 'plan_mapping' | 'component_mapping'>,
): Pick<MergeDraft, 'plan_mapping' | 'component_mapping'> => {
  const plan_mapping = {
    ...(suggestion?.plan_mapping ?? {}),
    ...current.plan_mapping,
  };
  const component_mapping: ComponentMapping = {};
  const offerings = new Set([
    ...Object.keys(suggestion?.component_mapping ?? {}),
    ...Object.keys(current.component_mapping),
  ]);
  offerings.forEach((offering) => {
    component_mapping[offering] = {
      ...(suggestion?.component_mapping?.[offering] ?? {}),
      ...(current.component_mapping[offering] ?? {}),
    };
  });
  return { plan_mapping, component_mapping };
};

/**
 * A mapping handed to the wizard with its offerings (a duplicate group's
 * suggestion) applies only while staff keep exactly those offerings; any
 * other selection falls back to asking the backend.
 */
export const getPresetSuggestion = (
  preset: OfferingMergeSuggestedMapping | null | undefined,
  presetSelection: { sources: string[]; target?: string | null },
  selection: { sources: string[]; target?: string | null },
): OfferingMergeSuggestedMapping | undefined => {
  if (!preset || !selection.target) {
    return undefined;
  }
  const same =
    presetSelection.target === selection.target &&
    presetSelection.sources.length === selection.sources.length &&
    presetSelection.sources.every((uuid) => selection.sources.includes(uuid));
  return same ? preset : undefined;
};

export const getDraftFromMerge = (merge: OfferingMerge): MergeDraft => ({
  plan_mapping: merge.plan_mapping ?? {},
  component_mapping: merge.component_mapping ?? {},
  attribute_key_mapping: merge.attribute_key_mapping ?? {},
  invoice_policy: merge.invoice_policy ?? 'open_month',
});

const withoutEmpty = (mapping: Record<string, string>) =>
  Object.fromEntries(Object.entries(mapping).filter(([, value]) => value));

const normalizeDraft = (draft: MergeDraft): MergeDraft => ({
  plan_mapping: withoutEmpty(draft.plan_mapping),
  component_mapping: Object.fromEntries(
    Object.entries(draft.component_mapping)
      .map(([offering, mapping]) => [offering, withoutEmpty(mapping)])
      .filter(([, mapping]) => Object.keys(mapping).length > 0),
  ),
  attribute_key_mapping: withoutEmpty(draft.attribute_key_mapping),
  invoice_policy: draft.invoice_policy,
});

const sameMapping = (a: unknown, b: unknown) =>
  JSON.stringify(sortKeys(a)) === JSON.stringify(sortKeys(b));

const sortKeys = (value: unknown): unknown => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.keys(value)
      .sort()
      .reduce(
        (result, key) => ({ ...result, [key]: sortKeys(value[key]) }),
        {},
      );
  }
  return value;
};

/**
 * The fields of the draft that differ from the stored record, as a PATCH
 * body. An empty object means there is nothing to save; saving anything
 * returns a previewed record to draft and discards its preview.
 */
export const getDraftChanges = (
  merge: OfferingMerge,
  draft: MergeDraft,
): PatchedOfferingMergeRequest => {
  const stored = normalizeDraft(getDraftFromMerge(merge));
  const edited = normalizeDraft(draft);
  const changes: PatchedOfferingMergeRequest = {};
  if (!sameMapping(stored.plan_mapping, edited.plan_mapping)) {
    changes.plan_mapping = edited.plan_mapping;
  }
  if (!sameMapping(stored.component_mapping, edited.component_mapping)) {
    changes.component_mapping = edited.component_mapping;
  }
  if (
    !sameMapping(stored.attribute_key_mapping, edited.attribute_key_mapping)
  ) {
    changes.attribute_key_mapping = edited.attribute_key_mapping;
  }
  if (stored.invoice_policy !== edited.invoice_policy) {
    changes.invoice_policy = edited.invoice_policy;
  }
  return changes;
};

/**
 * The stored preview is current only while the record is previewed: the
 * backend returns an edited record to draft and clears its preview.
 */
export const isPreviewCurrent = (merge?: OfferingMerge) =>
  merge?.state === 'previewed' && Boolean(merge.preview);

export const isEditable = (state?: OfferingMergeStateEnum) =>
  EDITABLE_STATES.includes(state);

export const isPreviewable = (state?: OfferingMergeStateEnum) =>
  PREVIEWABLE_STATES.includes(state);

export const isActive = (state?: OfferingMergeStateEnum) =>
  ACTIVE_STATES.includes(state);

/**
 * Whether the drill-down describes what was written rather than what is
 * planned. Once a merge has run, the endpoint reads its journal, and a row the
 * merge deliberately did not write is absent from it.
 */
export const listsFromJournal = (state?: OfferingMergeStateEnum) =>
  JOURNALLED_STATES.includes(state);

/** Poll while a task works on the record; stop on every settled state. */
export const getRefetchInterval = (merge?: OfferingMerge): number | false =>
  merge && isActive(merge.state) ? POLL_INTERVAL : false;

/**
 * Why execute is not available yet, one line each. Empty means execute may
 * be pressed: the preview is current, has no blockers, and every warning is
 * acknowledged.
 */
export const getExecuteBlockers = (
  merge: OfferingMerge | undefined,
  acknowledged: string[],
  unsavedChanges = false,
): string[] => {
  if (!merge) {
    return [translate('The merge is not saved yet.')];
  }
  if (!isPreviewable(merge.state)) {
    return [
      translate('The merge is {state}.', {
        state: getMergeStateLabel(merge.state),
      }),
    ];
  }
  if (unsavedChanges) {
    return [translate('Save the changed mappings and run the preview again.')];
  }
  if (!isPreviewCurrent(merge)) {
    return [
      translate(
        'Run the preview first. Changing a mapping discards the previous one.',
      ),
    ];
  }
  const reasons: string[] = [];
  const blockers = merge.preview.blockers ?? [];
  if (blockers.length) {
    reasons.push(
      translate('Resolve {count} blocker(s) first.', {
        count: blockers.length,
      }),
    );
  }
  const missing = getMissingAcknowledgements(
    merge.preview.warnings ?? [],
    acknowledged,
  );
  if (missing.length) {
    reasons.push(
      translate('Acknowledge the warnings: {codes}.', {
        codes: missing.join(', '),
      }),
    );
  }
  return reasons;
};

export const getMissingAcknowledgements = (
  warnings: OfferingMergeIssue[],
  acknowledged: string[],
) =>
  Array.from(new Set(warnings.map((warning) => warning.code))).filter(
    (code) => !acknowledged.includes(code),
  );

/**
 * Answer keys the sources' order forms define and the target's does not.
 * Orders on the sources may carry them, and the target would not show them.
 */
export const getUnknownAnswerKeys = (
  sources: OfferingOptionsLike[],
  target: OfferingOptionsLike | undefined,
): string[] => {
  const targetKeys = new Set(Object.keys(target?.options?.options ?? {}));
  const keys = new Set<string>();
  sources.forEach((source) =>
    Object.keys(source?.options?.options ?? {}).forEach((key) => {
      if (!targetKeys.has(key)) {
        keys.add(key);
      }
    }),
  );
  return Array.from(keys).sort();
};

export const getMergeStateLabel = (state: OfferingMergeStateEnum): string =>
  ({
    draft: translate('Draft'),
    previewed: translate('Previewed'),
    queued: translate('Queued'),
    running: translate('Running'),
    done: translate('Done'),
    failed: translate('Failed'),
    undoing: translate('Undoing'),
    undone: translate('Undone'),
  })[state] ?? state;

/**
 * Coverage entries are labelled "app.Model.field". Show the model and the
 * field so the reader can tell moved rows from rewritten references.
 */
const formatCoverageLabel = (label: string): string => {
  const parts = label.split('.');
  if (parts.length < 3) {
    return label;
  }
  const [, model, ...field] = parts;
  const words = model.replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase();
  return `${words.charAt(0).toUpperCase()}${words.slice(1)} (${field
    .join('.')
    .replace(/_/g, ' ')})`;
};

export const RESOURCE_COUNT_KEY = 'marketplace.Resource.offering';

/**
 * Readable names for the coverage entries, built on call so the translation
 * catalogue is loaded by the time they are read. An entry the map does not
 * name falls back to its label, humanised.
 */
const getCoverageTitles = (): Record<string, string> => ({
  'marketplace.Resource.offering': translate('Resources'),
  'marketplace.Resource.plan': translate('Plans of the resources'),
  'marketplace.Resource.limits': translate('Limits of the resources'),
  'marketplace.Resource.current_usages': translate('Usages of the resources'),
  'marketplace.Resource.attributes': translate(
    'Order answers of the resources',
  ),
  'marketplace.Order.offering': translate('Orders'),
  'marketplace.Order.plan': translate('Plans of the orders'),
  'marketplace.Order.old_plan': translate('Previous plans of the orders'),
  'marketplace.Order.limits': translate('Limits of the orders'),
  'marketplace.Order.attributes': translate('Answers of the orders'),
  'marketplace.ResourceProject.limits': translate('Project resource limits'),
  'marketplace.ResourceProject.current_usages': translate(
    'Project resource usages',
  ),
  'marketplace.ResourceLimitChangeRequest.requested_limits': translate(
    'Limit change requests',
  ),
  'marketplace.ResourcePlanPeriod.plan': translate('Billing periods'),
  'marketplace.ComponentUsage.component': translate('Usage records'),
  'marketplace.ComponentUsageMonthly.component': translate(
    'Monthly usage summaries',
  ),
  'marketplace.ComponentQuota.component': translate('Component quotas'),
  'marketplace.ComponentUsagePollRecord.component': translate(
    'Usage polling state',
  ),
  'marketplace.ComponentUserUsageLimit.component': translate(
    'Per-user usage limits',
  ),
  'invoices.InvoiceItem.plan_component': translate(
    'Invoice lines and their plan component',
  ),
  'invoices.InvoiceItem.details': translate('Invoice lines and their details'),
  'marketplace.OfferingUser.offering': translate('Offering users'),
  'marketplace.OfferingUserGroup.offering': translate('Offering user groups'),
  'marketplace.OfferingRoleGroup.offering': translate('Offering role groups'),
  'marketplace.PosixIdPool.offering': translate('POSIX id pools'),
  'support.Issue.offering': translate('Support requests'),
  'invoices.CustomerCredit.offerings': translate('Customer credits'),
  'policy.CustomerUsagePolicyComponent.component': translate(
    'Usage policy components',
  ),
  'proposal.RequestedOffering.offering': translate(
    'Offerings requested in proposals',
  ),
  'proposal.RequestedOffering.plan': translate('Plans requested in proposals'),
  'waldur_autoprovisioning.Rule.plan': translate('Autoprovisioning rules'),
  'waldur_autoprovisioning.Rule.plan_limits': translate(
    'Limits of the autoprovisioning rules',
  ),
  'waldur_openportal.ProjectTemplate.offerings': translate('Project templates'),
  'marketplace.Plan.offering': translate('Plans'),
  'marketplace.OfferingComponent.offering': translate('Offering components'),
  'marketplace.PlanComponent.plan': translate('Plan components'),
  'marketplace.UserOfferingConsent.offering': translate('User consents'),
  'marketplace.OfferingTermsOfService.offering': translate('Terms of service'),
  'marketplace.Screenshot.offering': translate('Screenshots'),
  'marketplace.OfferingFile.offering': translate('Offering files'),
  'permissions.UserRole.scope': translate('Role assignments'),
});

const getCoverageTitle = (label: string): string =>
  getCoverageTitles()[label] ?? formatCoverageLabel(label);

/** One coverage entry as the preview tables render it. */
export interface MergeEntryRow {
  label: string;
  title: string;
  areaTitle: string;
  effectTitle: string;
  count: number;
  leftOnSource: number;
  canListRows: boolean;
}

/** The entries of one area, in the order the API reported them. */
interface MergeEntryArea {
  key: string;
  title: string;
  rows: MergeEntryRow[];
}

export interface GroupedMergeEntries {
  areas: MergeEntryArea[];
  /**
   * Entries whose rows stay behind. With the grouped payload these are the
   * ``kept_on_source`` entries — configuration that describes the source
   * offering. With the legacy payload they are something else entirely (see
   * ``legacy``), so the two must not be described in the same words.
   */
  keptOnSource: MergeEntryRow[];
  /**
   * The preview predates the grouped payload, so area, effect and the meaning
   * of ``keptOnSource`` are all unknown.
   */
  legacy: boolean;
}

const toEntryRow = (entry: OfferingMergeEntry): MergeEntryRow => ({
  label: entry.label,
  title: getCoverageTitle(entry.label),
  areaTitle: entry.area_title,
  effectTitle: entry.effect_title,
  count: entry.count,
  leftOnSource: entry.left_on_source,
  canListRows: entry.can_list_rows,
});

const toLegacyRow = (label: string, count: number): MergeEntryRow => ({
  label,
  title: getCoverageTitle(label),
  areaTitle: '',
  effectTitle: '',
  count,
  leftOnSource: 0,
  canListRows: false,
});

const positiveEntries = (counts: Record<string, number> | undefined) =>
  Object.entries(counts ?? {}).filter(([, count]) => count > 0);

/**
 * A preview stored before the API grouped its counts carries only the two flat
 * maps. Show them as one unclassified group rather than an empty panel.
 */
const groupLegacyCounts = (
  preview: OfferingMergePreview,
): GroupedMergeEntries => {
  const counts = positiveEntries(preview?.counts);
  return {
    areas: counts.length
      ? [
          {
            key: 'counts',
            title: translate('What the merge changes'),
            rows: counts.map(([label, count]) => toLegacyRow(label, count)),
          },
        ]
      : [],
    // In the legacy payload left_on_source counts collisions: rows that would
    // have moved, but the target has an equivalent already. That is not the
    // offering configuration the grouped payload keeps on the source, so the
    // view titles this section differently when the flag is set.
    keptOnSource: positiveEntries(preview?.left_on_source).map(
      ([label, count]) => toLegacyRow(label, count),
    ),
    legacy: true,
  };
};

/**
 * The preview's entries by area, in the order the API lists them, with the
 * entries that stay on the source kept apart from the ones that move.
 */
export const groupMergeEntries = (
  preview: OfferingMergePreview,
): GroupedMergeEntries => {
  const entries = (preview?.entries ?? []).filter((entry) => entry.count > 0);
  if (entries.length === 0) {
    return groupLegacyCounts(preview);
  }
  const areas: MergeEntryArea[] = [];
  const keptOnSource: MergeEntryRow[] = [];
  entries.forEach((entry) => {
    const row = toEntryRow(entry);
    if (entry.effect === KEPT_ON_SOURCE_EFFECT) {
      keptOnSource.push(row);
      return;
    }
    const area = areas.find((item) => item.key === entry.area);
    if (area) {
      area.rows.push(row);
    } else {
      areas.push({ key: entry.area, title: entry.area_title, rows: [row] });
    }
  });
  return { areas, keptOnSource, legacy: false };
};

/** A details key as a label: "invoice_items" becomes "Invoice items". */
export const humanizeDetailsKey = (key: string): string => {
  const words = key.replace(/_/g, ' ').trim();
  return words ? `${words.charAt(0).toUpperCase()}${words.slice(1)}` : key;
};

const summarizeDetailsValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return translate('none');
  }
  if (Array.isArray(value)) {
    return translate('{count} item(s)', { count: value.length });
  }
  if (typeof value === 'object') {
    return translate('{count} field(s)', {
      count: Object.keys(value).length,
    });
  }
  if (typeof value === 'number') {
    return value.toLocaleString();
  }
  if (typeof value === 'boolean') {
    return value ? translate('yes') : translate('no');
  }
  return String(value);
};

/** The number of top-level details keys a row summary names before eliding. */
const SUMMARY_KEYS = 3;

/**
 * One line describing a check's details, so the common case is readable in the
 * table and only an interesting check needs the dialog.
 */
export const summarizeCheckDetails = (
  details: Record<string, unknown> | undefined,
): string => {
  const entries = Object.entries(details ?? {});
  if (entries.length === 0) {
    return '';
  }
  const summary = entries
    .slice(0, SUMMARY_KEYS)
    .map(
      ([key, value]) =>
        `${humanizeDetailsKey(key)}: ${summarizeDetailsValue(value)}`,
    )
    .join(', ');
  return entries.length > SUMMARY_KEYS ? `${summary}…` : summary;
};

/**
 * One line per area saying what its rows are about, for the help bubble on
 * the section heading. An area the map does not know shows no bubble.
 */
export const getAreaHelp = (area: string): string | undefined =>
  ({
    resources_and_orders: translate(
      'The resources the merge moves to the target, with the orders, limits and order answers that follow them.',
    ),
    billing_history: translate(
      'Usage records, billing periods and quotas of past months. They follow the resources so history stays with them.',
    ),
    invoices: translate(
      'Lines already written on invoices. They are not moved: they are rewritten in place, as far as the invoice policy allows.',
    ),
    accounts_and_access: translate(
      'Accounts, user groups and access records tied to the offering. An account the target already has stays on the source.',
    ),
    offering_configuration: translate(
      'Settings that describe an offering itself, such as its plans and components.',
    ),
  })[area];
