import {
  callManagingOrganisationsCreate,
  callManagingOrganisationsList,
  proposalProtectedCallsActivate,
  proposalProtectedCallsCreate,
  proposalProtectedCallsOfferingsSet,
  proposalProtectedCallsRoundsSet,
  proposalProtectedCallsWorkflowStepsList,
  proposalProtectedCallsWorkflowStepsPartialUpdate,
  proposalRequestedOfferingsAccept,
} from 'waldur-js-client';

import { ENV } from '@/core/config';

/**
 * Everything an offering needs before an applicant can ask for it.
 *
 * Making an offering requestable is six objects deep — a managing
 * organisation, a call, a round, the call's entry for the offering, that
 * entry's acceptance, and finally activation — and the activate endpoint
 * rejects a call missing any of them. Done by hand it is a long trip through
 * four screens; the steps never vary, so they are scripted here.
 *
 * Each step is announced before it runs, so a failure names the step it fell
 * over on rather than the last thing that worked.
 */
export interface OfferViaCallInput {
  offeringUuid: string;
  /**
   * Organisation that will run the call. Chosen rather than assumed: the
   * provider publishing an offering and the body handling the requests for it
   * are routinely different organisations, and the call manager is the one
   * whose members end up reviewing proposals.
   */
  managerCustomerUuid: string;
  /** Name for the call; the offering's own name is a sensible default. */
  name: string;
  /** ISO timestamp after which the call stops accepting requests. */
  cutoffTime: string;
  /** Priced against this. `activate` refuses an accepted offering without one. */
  planUuid: string;
  /**
   * Workflow steps to leave enabled, on top of the mandatory allocation
   * decision. Empty means the request goes straight to a single approve or
   * reject, which is what this action is for; anything more is a review
   * process the operator asked for explicitly.
   */
  enabledSteps: string[];
  onProgress?: (step: OfferViaCallStep) => void;
}

export type OfferViaCallStep =
  | 'organisation'
  | 'call'
  | 'workflow'
  | 'round'
  | 'offering'
  | 'accept'
  | 'activate';

/**
 * Provisioned by the allocation decision's `include_award_response` flag rather
 * than on its own, and the serializer refuses a direct write — so it is never
 * part of what this action reconciles.
 */
const AWARD_RESPONSE_STEP = 'award_response';

const apiUrl = (path: string, uuid: string) =>
  `${ENV.apiEndpoint}api/${path}/${uuid}/`;

/** Reuses the organisation's call-manager registration, else creates one. */
const ensureManagingOrganisation = async (customerUuid: string) => {
  const existing = await callManagingOrganisationsList({
    query: { customer_uuid: customerUuid },
  });
  const found = (existing.data as any[])?.[0];
  if (found?.url) {
    return found.url as string;
  }
  const created = await callManagingOrganisationsCreate({
    body: { customer: apiUrl('customers', customerUuid) },
  });
  return (created.data as any).url as string;
};

/**
 * Brings the call's seeded steps in line with what was asked for.
 *
 * The backend seeds every catalogue step on creation and enables the
 * call-manager-owned ones — today the administrative check as well as the
 * allocation decision — so leaving it alone would hand back a two-stage call
 * nobody asked for. Only the differences are written.
 *
 * Mandatory steps are enabled whatever the caller says: the API refuses to
 * disable one, and `activate` refuses a call missing one.
 */
const applyWorkflowSteps = async (callUuid: string, enabled: string[]) => {
  const steps = await proposalProtectedCallsWorkflowStepsList({
    path: { uuid: callUuid },
  });
  // The endpoint returns the steps in catalogue order, which is also
  // dependency order — expert review before the panel review that needs it.
  const rows = ((steps.data as any[]) || []).filter(
    (row) => row.step !== AWARD_RESPONSE_STEP,
  );
  const wanted = (row: any) => row.is_mandatory || enabled.includes(row.step);
  const changed = rows.filter((row) => Boolean(row.is_enabled) !== wanted(row));

  // Sequential, and dependents are torn down before the step they depend on
  // while dependencies are switched on before the steps that need them — an
  // intermediate state where a dependent outlives its dependency is rejected.
  const ordered = [
    ...changed.filter((row) => !wanted(row)).reverse(),
    ...changed.filter(wanted),
  ];
  for (const row of ordered) {
    await proposalProtectedCallsWorkflowStepsPartialUpdate({
      path: { uuid: callUuid, obj_uuid: row.uuid },
      body: { is_enabled: wanted(row) },
    });
  }
};

/**
 * Runs the chain and returns the new call's uuid.
 *
 * Deliberately not transactional — there is no endpoint that would make it so.
 * A failure part-way leaves a draft call, which is inert (applicants only see
 * active ones) and can be finished or deleted from the call management UI.
 */
export const offerViaCall = async (
  input: OfferViaCallInput,
): Promise<string> => {
  const announce = (step: OfferViaCallStep) => input.onProgress?.(step);

  announce('organisation');
  const manager = await ensureManagingOrganisation(input.managerCustomerUuid);

  announce('call');
  const call = await proposalProtectedCallsCreate({
    body: { name: input.name, manager },
  });
  const callUuid = (call.data as any).uuid as string;

  announce('workflow');
  await applyWorkflowSteps(callUuid, input.enabledSteps);

  // Rounds are the submission windows; without one the call cannot activate.
  // Opening it now rather than at some future date is the point of the whole
  // action — the offering should be requestable as soon as this returns.
  announce('round');
  await proposalProtectedCallsRoundsSet({
    path: { uuid: callUuid },
    body: {
      start_time: new Date().toISOString(),
      cutoff_time: input.cutoffTime,
    },
  });

  announce('offering');
  const requested = await proposalProtectedCallsOfferingsSet({
    path: { uuid: callUuid },
    body: {
      offering: apiUrl('marketplace-public-offerings', input.offeringUuid),
      plan: apiUrl('marketplace-plans', input.planUuid),
    },
  });

  // A call entry starts as merely *requested*: the provider still has to agree
  // to be listed. Here the two parties are the same person, so the consent is
  // implied by invoking this at all.
  announce('accept');
  await proposalRequestedOfferingsAccept({
    path: { uuid: (requested.data as any).uuid },
  });

  announce('activate');
  await proposalProtectedCallsActivate({ path: { uuid: callUuid } });

  return callUuid;
};
