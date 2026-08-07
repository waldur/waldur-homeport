import {
  callManagingOrganisationsCreate,
  callManagingOrganisationsList,
  proposalProtectedCallsActivate,
  proposalProtectedCallsCreate,
  proposalProtectedCallsOfferingsSet,
  proposalProtectedCallsRoundsSet,
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
  customerUuid: string;
  /** Name for the call; the offering's own name is a sensible default. */
  name: string;
  /** ISO timestamp after which the call stops accepting requests. */
  cutoffTime: string;
  /** Priced against this. `activate` refuses an accepted offering without one. */
  planUuid: string;
  onProgress?: (step: OfferViaCallStep) => void;
}

export type OfferViaCallStep =
  'organisation' | 'call' | 'round' | 'offering' | 'accept' | 'activate';

const apiUrl = (path: string, uuid: string) =>
  `${ENV.apiEndpoint}api/${path}/${uuid}/`;

/** Reuses the customer's managing organisation, else registers one. */
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
  const manager = await ensureManagingOrganisation(input.customerUuid);

  announce('call');
  const call = await proposalProtectedCallsCreate({
    body: { name: input.name, manager },
  });
  const callUuid = (call.data as any).uuid as string;

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
