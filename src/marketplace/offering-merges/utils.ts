import {
  InvoicePolicyEnum,
  OfferingMerge,
  OfferingMergeIssue,
  OfferingMergeStateEnum,
  OfferingMergeSuggestedMapping,
  PatchedOfferingMergeRequest,
} from 'waldur-js-client';

import { translate } from '@/i18n';

import {
  ACTIVE_STATES,
  CROSS_TYPE_MERGEABLE_TYPES,
  EDITABLE_STATES,
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
export const formatCoverageLabel = (label: string): string => {
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
