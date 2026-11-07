import { FC, ReactNode, useCallback } from 'react';
import { User } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { isOnProposalTeam } from '@/proposals/team/teamRules';
import { Proposal } from '@/proposals/types';
import { useUser } from '@/workspace/hooks';

type ActingUser = Pick<User, 'uuid' | 'is_staff' | 'permissions'>;
type ActingProposal = Pick<Proposal, 'uuid' | 'state' | 'created_by_uuid'>;

/**
 * Whether the viewer changes the proposal for its applicant: it has been
 * submitted, and the viewer is not on the applicant team (its creator or a
 * holder of a role on it). Staff and the call team may still change it then,
 * but the backend records the change with their name, so the UI says so
 * before they make it.
 */
export const isActingForApplicant = (
  user: ActingUser | null | undefined,
  proposal: ActingProposal | null | undefined,
): boolean =>
  Boolean(user && proposal?.state) &&
  proposal.state !== 'draft' &&
  !isOnProposalTeam(user, proposal);

export const useActingForApplicant = (
  proposal: ActingProposal | null | undefined,
): boolean => isActingForApplicant(useUser(), proposal);

/** The sentence every such confirmation carries. */
export const applicantChangeNote = (applicantTold = true): string =>
  applicantTold
    ? translate(
        'You are changing what the applicant submitted. The change is recorded with your name, and the applicant is told.',
      )
    : translate(
        'You are changing what the applicant submitted. The change is recorded with your name.',
      );

const ApplicantChangeBody: FC<{
  /** What the change is, in the dialog's first line. */
  what?: ReactNode;
  applicantTold?: boolean;
}> = ({ what, applicantTold = true }) => (
  <div
    className="flex flex-col gap-1.5"
    data-testid="applicant-change-confirmation"
  >
    {what ? <p className="mb-0">{what}</p> : null}
    <p className="mb-0">{applicantChangeNote(applicantTold)}</p>
    <p className="mb-0">{translate('Continue?')}</p>
  </div>
);

interface ConfirmApplicantChangeOptions {
  /** Whether the applicant is notified of the change; true unless the
   * backend tells only the call team, as for the award. */
  applicantTold?: boolean;
  title?: string;
  /** Ask the applicant team too, without the note: for a change confirmed
   * anyway, such as a removal. */
  alwaysAsk?: boolean;
  /** The confirming button's label, "Continue" by default. */
  positiveButton?: string;
}

/**
 * Returns a function that asks the viewer to confirm a change to the
 * applicant's submission, resolving to whether to go on. Without asking, it
 * resolves to true for the applicant team and for a draft, unless
 * `alwaysAsk` is given.
 */
export const useConfirmApplicantChange = (
  proposal: ActingProposal | null | undefined,
) => {
  const acting = useActingForApplicant(proposal);
  const { confirm } = useModal();
  return useCallback(
    async (
      what?: ReactNode,
      {
        applicantTold = true,
        title,
        alwaysAsk = false,
        positiveButton,
      }: ConfirmApplicantChangeOptions = {},
    ): Promise<boolean> => {
      if (!acting && !alwaysAsk) {
        return true;
      }
      try {
        await confirm(
          title ?? translate("Change the applicant's submission"),
          acting ? (
            <ApplicantChangeBody what={what} applicantTold={applicantTold} />
          ) : (
            what
          ),
          {
            type: 'warning',
            positiveButton: positiveButton ?? translate('Continue'),
            negativeButton: translate('Cancel'),
          },
        );
        return true;
      } catch {
        return false;
      }
    },
    [acting, confirm],
  );
};
