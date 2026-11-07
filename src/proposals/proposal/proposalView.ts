import { useCurrentStateAndParams } from '@uirouter/react';
import { createContext, useContext } from 'react';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { userHasRole } from '@/permissions/hasPermission';
import { isOnProposalTeam } from '@/proposals/team/teamRules';
import { Proposal } from '@/proposals/types';
import { useUser } from '@/workspace/hooks';
import { User } from '@/workspace/types';

/** The proposal page as an offering's team reads it, in its provider's
 * workspace. */
export const OFFERING_TEAM_PROPOSAL_STATE = 'provider-call-proposal';

export type ProposalView =
  'applicant' | 'reviewer' | 'offering_team' | 'call_manager';

/** Whose view of the proposal page the route `stateName` is. */
export const proposalViewOf = (stateName: string | undefined): ProposalView => {
  if (stateName?.startsWith('call-management')) return 'call_manager';
  if (stateName === OFFERING_TEAM_PROPOSAL_STATE) return 'offering_team';
  if (stateName === 'proposal-review' || stateName === 'proposal-review-view') {
    return 'reviewer';
  }
  return 'applicant';
};

export interface OwnProposalViews {
  /** The call team's view: the call's managers and organisers. */
  callManager: boolean;
  /** The providers whose offering team's view the user has. */
  offeringTeams: { uuid: string; name: string }[];
}

/**
 * The views of the proposal the user has besides the applicant's, one rule
 * for the tabs and for whether the applicant's view is a preview to them.
 */
export const ownProposalViews = (
  user: User,
  proposal: Pick<
    Proposal,
    'call_uuid' | 'call_managing_organisation_uuid' | 'offering_team_providers'
  >,
): OwnProposalViews => {
  if (
    !proposal ||
    !isFeatureVisible(MarketplaceFeatures.show_call_management_functionality)
  ) {
    return { callManager: false, offeringTeams: [] };
  }
  return {
    callManager:
      userHasRole(user, 'CALL.MANAGER', proposal.call_uuid) ||
      userHasRole(
        user,
        'CUSTOMER.CALL_ORGANIZER',
        proposal.call_managing_organisation_uuid,
      ),
    offeringTeams: proposal.offering_team_providers ?? [],
  };
};

/**
 * Whether the user has a view of the proposal besides the applicant's: the
 * call team's, or an offering team's. Then the applicant's view is a preview
 * for them. An evaluator, or someone handed a slot, has no other: the plain
 * page is where they work.
 */
export const hasOwnProposalView = (
  user: User,
  proposal: Pick<
    Proposal,
    'call_uuid' | 'call_managing_organisation_uuid' | 'offering_team_providers'
  >,
): boolean => {
  const views = ownProposalViews(user, proposal);
  return views.callManager || views.offeringTeams.length > 0;
};

/**
 * The view a preview of the page renders, whatever the route: the call
 * team's "Preview as…" shows the page as a role reads it, inside the call
 * manager's route.
 */
export const ProposalViewOverride = createContext<ProposalView | undefined>(
  undefined,
);

/**
 * Whose view of the proposal the page shows, and whether it is the
 * applicant's view read by someone off the applicant team who has a view of
 * their own: a preview of what the applicant reads, their own work being on
 * their own view's tab. The page narrows this further for someone who also
 * works on the plain page (``ProposalDetails``).
 */
export const useProposalView = (
  proposal: Proposal | undefined,
): { view: ProposalView; preview: boolean } => {
  const { state } = useCurrentStateAndParams();
  const user = useUser();
  const override = useContext(ProposalViewOverride);
  const view = override ?? proposalViewOf(state.name);
  return {
    view,
    preview:
      view === 'applicant' &&
      Boolean(proposal) &&
      !isOnProposalTeam(user, proposal) &&
      hasOwnProposalView(user, proposal),
  };
};
