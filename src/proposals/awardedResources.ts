import { useQuery } from '@tanstack/react-query';
import {
  AwardedResource,
  proposalProposalsAwardedResourcesList,
  ProposalWorkflowStepInstance,
  RequestedResource,
} from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { translate } from '@/i18n';
import { PREPAID_DURATION_MONTHS } from '@/proposals/prepaidDuration';
import { getRowLimits } from '@/proposals/requestedResourceCost';
import { HELD_DECISION_STEP } from '@/proposals/roundLifecycle';
import { Proposal } from '@/proposals/types';

export const awardedResourcesKey = (proposalUuid: string) =>
  ['proposal-awarded-resources', proposalUuid] as const;

const isForbidden = (error: any) =>
  error?.response?.status === 403 || error?.status === 403;

/**
 * What the allocation decision awards the proposal.
 *
 * Resolves to null when the viewer may not read it: the applicant before the
 * decision is released (and while a decision is held for the round's
 * publication, even where the call shows the award to applicants),
 * reviewers and panel members always. That is a
 * "not shown", not an error — the award is simply not theirs to see yet — so
 * the 403 is settled here instead of reaching the global handler, which would
 * send the whole page to the no-permission screen.
 */
export const useAwardedResources = (proposalUuid: string, enabled: boolean) =>
  useQuery({
    queryKey: awardedResourcesKey(proposalUuid),
    queryFn: () =>
      getAllPages<AwardedResource>((page) =>
        proposalProposalsAwardedResourcesList({
          path: { uuid: proposalUuid },
          query: { page, page_size: MAX_PAGE_SIZE },
        }),
      ).catch((error) => {
        if (isForbidden(error)) {
          return null;
        }
        throw error;
      }),
    enabled: Boolean(proposalUuid) && enabled,
    refetchOnWindowFocus: false,
    meta: { skipGlobalErrorRedirect: true },
  });

/**
 * Whether the allocation decision is open, so the award may still change. A
 * decision that is recorded but held for the round's publication is closed:
 * the backend refuses award edits (409) until the decision is reopened, which
 * makes the allocation step active again. `decision_held` is null for
 * viewers who may not know about held decisions, who never edit anyway.
 */
export const isAwardDecisionOpen = (
  proposal: Pick<Proposal, 'decision_held'>,
  activeStep: Pick<ProposalWorkflowStepInstance, 'step'> | undefined,
) => activeStep?.step === HELD_DECISION_STEP && proposal.decision_held !== true;

/**
 * Whether the viewer is offered the award editor: a call manager (or staff)
 * while the allocation decision is open.
 */
export const canEditAward = (
  canDecide: boolean,
  proposal: Pick<Proposal, 'decision_held'>,
  activeStep: Pick<ProposalWorkflowStepInstance, 'step'> | undefined,
) => canDecide && isAwardDecisionOpen(proposal, activeStep);

/**
 * Whether the proposal has got as far as an allocation decision, so an award
 * can exist. Before that there is nothing to ask for.
 */
export const hasReachedAllocationDecision = (
  proposal: Pick<Proposal, 'state'>,
  workflowStates: ProposalWorkflowStepInstance[] | undefined,
) =>
  proposal.state === 'accepted' ||
  (workflowStates ?? []).some(
    (s) =>
      (s.step === 'allocation_decision' || s.step === 'award_response') &&
      s.status !== 'pending' &&
      s.status !== 'skipped',
  );

/** The award section's anchor, which the page's progress rail links to. */
export const AWARDED_RESOURCES_SECTION_ID = 'step-awarded-resources';

/**
 * Whether the award section is on the page once the award has loaded: never
 * for a viewer refused it (null), and for a reader only when something is
 * awarded. The editor shows even while empty, so the first item can be added.
 */
export const isAwardSectionShown = (
  awards: AwardedResource[] | null | undefined,
  editable: boolean,
) => Array.isArray(awards) && (editable || awards.length > 0);

/**
 * The page's progress rail with the award section in it, right after the
 * request it answers, when the section is shown.
 */
export const withAwardedResourcesStep = <T extends { id: string }>(
  steps: T[],
  shown: boolean,
): Array<T | { id: string; label: string }> => {
  if (!shown) {
    return steps;
  }
  const step = {
    id: AWARDED_RESOURCES_SECTION_ID,
    label: translate('Awarded resources'),
  };
  const after = steps.findIndex((s) => s.id === 'step-resource-requests');
  return after === -1
    ? [...steps, step]
    : [...steps.slice(0, after + 1), step, ...steps.slice(after + 1)];
};

type AwardChange = 'unchanged' | 'changed' | 'moved' | 'added' | 'removed';

/** One line of the award set against the request it came from, if any. */
export interface AwardComparisonRow {
  uuid: string;
  requested?: RequestedResource;
  awarded?: AwardedResource;
  change: AwardChange;
}

const sameLimits = (a: Record<string, number>, b: Record<string, number>) => {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  return [...keys].every((key) => Number(a[key] ?? 0) === Number(b[key] ?? 0));
};

const prepaidMonths = (attributes?: Record<string, unknown> | null) =>
  Number(attributes?.[PREPAID_DURATION_MONTHS] ?? 0);

const compareItem = (
  requested: RequestedResource,
  awarded: AwardedResource,
): AwardChange => {
  if (awarded.requested_offering.uuid !== requested.requested_offering.uuid) {
    return 'moved';
  }
  const requestedPlan = requested.requested_offering.plan_details?.uuid;
  if (awarded.plan && requestedPlan && awarded.plan !== requestedPlan) {
    return 'changed';
  }
  if (!sameLimits(getRowLimits(requested), getRowLimits(awarded))) {
    return 'changed';
  }
  if (
    prepaidMonths(requested.attributes) !== prepaidMonths(awarded.attributes)
  ) {
    return 'changed';
  }
  return 'unchanged';
};

/**
 * Pairs each award item with the request it was prefilled from.
 *
 * Award order first — that is the order it provisions in — then every request
 * the award no longer covers, so "asked for, not granted" stays visible.
 */
export const compareAward = (
  requests: RequestedResource[],
  awards: AwardedResource[],
): AwardComparisonRow[] => {
  const byUuid = new Map(requests.map((r) => [r.uuid, r]));
  const covered = new Set<string>();
  const rows: AwardComparisonRow[] = awards.map((awarded) => {
    const requested = awarded.requested_resource
      ? byUuid.get(awarded.requested_resource)
      : undefined;
    if (!requested) {
      return { uuid: awarded.uuid, awarded, change: 'added' };
    }
    covered.add(requested.uuid);
    return {
      uuid: awarded.uuid,
      requested,
      awarded,
      change: compareItem(requested, awarded),
    };
  });
  for (const requested of requests) {
    if (!covered.has(requested.uuid)) {
      rows.push({ uuid: requested.uuid, requested, change: 'removed' });
    }
  }
  return rows;
};

export const awardDiffers = (rows: AwardComparisonRow[]) =>
  rows.some((row) => row.change !== 'unchanged');

/**
 * Only the amounts the chosen offering has components for. An item moved to
 * another offering may still hold the old one's amounts, and the backend
 * refuses a limit it does not recognise.
 */
export const pickOfferingLimits = (
  limits: Record<string, number> | undefined,
  offering: { components?: Array<{ type: string }> } | undefined,
): Record<string, number> => {
  if (!limits) {
    return {};
  }
  if (!offering?.components?.length) {
    return limits;
  }
  const types = new Set(offering.components.map((c) => c.type));
  return Object.fromEntries(
    Object.entries(limits).filter(([type]) => types.has(type)),
  );
};

/**
 * An award item in the shape the request's cost helpers price. Only the call
 * offering's own plan travels with the row, so an item pinned to another plan
 * is left unpriced rather than priced at the wrong one.
 */
export const asCostRow = (awarded: AwardedResource) => {
  const offering = awarded.requested_offering;
  return awarded.plan && awarded.plan !== offering.plan_details?.uuid
    ? { ...awarded, requested_offering: { ...offering, plan_details: null } }
    : awarded;
};
