import { MyTask } from 'waldur-js-client';

import { proposalHref } from './router';

/**
 * Links into the main portal for what this app leaves to it: the proposal
 * page an assessment is written on, reviews, offerings and orders. Under the
 * portal (production, dev:subpath) the portal is this origin's root, even when
 * .env sets VITE_ROOT_APP_URL; on the standalone dev server (base '/') it is
 * VITE_ROOT_APP_URL.
 */
const UNDER_PORTAL = import.meta.env.BASE_URL !== '/';

export const ROOT_APP_URL: string = UNDER_PORTAL
  ? import.meta.env.BASE_URL.replace(/provider-calls\/$/, '')
  : import.meta.env.VITE_ROOT_APP_URL || '/';

const root = (path: string) => `${ROOT_APP_URL.replace(/\/$/, '')}${path}`;

/** The proposal as the offering team sees it, under its provider. */
export const offeringTeamProposalUrl = (
  providerUuid: string,
  proposalUuid: string,
  section?: string | null,
) =>
  root(
    `/providers/${providerUuid}/call-proposals/${proposalUuid}/${section ? `#${section}` : ''}`,
  );

export const providerOfferingRequestsUrl = (providerUuid: string) =>
  root(`/providers/${providerUuid}/offering-requests/`);

export const providerOrdersUrl = (providerUuid: string) =>
  root(`/providers/${providerUuid}/orders/`);

export const publicCallUrl = (callUuid: string) => root(`/calls/${callUuid}/`);

/**
 * Where a task opens, as the portal's MyTasksPage resolves it (getTaskTarget),
 * limited to the targets an offering team gets. Null for the rest; the
 * portal's own task list handles those.
 */
export const taskUrl = (task: MyTask): string | null => {
  switch (task.target) {
    case 'proposal':
      if (!task.proposal_uuid) {
        return null;
      }
      // The offering team's work opens on this app's proposal page.
      if (task.view === 'offering_team') {
        return proposalHref(task.proposal_uuid, task.target_section);
      }
      return root(
        `/proposals/${task.proposal_uuid}/${task.target_section ? `#${task.target_section}` : ''}`,
      );
    case 'review':
      return task.target_uuid
        ? root(`/proposal-review/${task.target_uuid}/`)
        : null;
    case 'offering_requests':
      return null; // answered here, on the Requests page
    default:
      return null;
  }
};

/** An order in the portal: its full details, comments and history. */
export const providerOrderUrl = (orderUuid: string) =>
  root(`/marketplace-order-details/${orderUuid}/`);
