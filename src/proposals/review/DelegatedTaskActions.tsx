import { CheckIcon, XIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import {
  MyTask,
  proposalProposalsAcceptContribution,
  proposalProposalsDeclineContribution,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { CoiDeclaration } from '@/proposals/coi-declaration/CoiDeclaration';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionsMenu } from '@/table/ActionsDropdown';

const CONTRIBUTION_KEY = 'contribution:';

/** The contribution a task about one names, from the task's key. */
export const taskContributionUuid = (task: MyTask): string | undefined =>
  task.key.startsWith(CONTRIBUTION_KEY)
    ? task.key.slice(CONTRIBUTION_KEY.length)
    : undefined;

/**
 * Accept or decline a contribution handed to the user, from the task list:
 * until they accept it, the proposal may not open to them.
 */
export const DelegatedTaskActions: FC<{
  task: MyTask;
  refetch(): void;
}> = ({ task, refetch }) => {
  const contributionUuid = taskContributionUuid(task);
  const path = { uuid: task.proposal_uuid ?? '' };
  const accept = useManagedMutation<any, any, void>({
    mutationFn: () =>
      proposalProposalsAcceptContribution({
        path,
        body: {
          contribution_uuid: contributionUuid ?? '',
          confirm_no_conflict: true,
        },
      }),
    confirmation: {
      title: translate('Accept the contribution'),
      body: task.coi_declaration_text ? (
        <>
          <p>{translate('You take this contribution over and fill it in.')}</p>
          <CoiDeclaration text={task.coi_declaration_text} fallback={null} />
        </>
      ) : (
        translate(
          'You take this contribution over and fill it in. You confirm that you have no conflict of interest with the proposal.',
        )
      ),
    },
    successMessage: translate('The contribution is yours to fill in.'),
    errorMessage: translate('Unable to accept the contribution.'),
    closeModal: false,
    refetch,
  });
  const decline = useManagedMutation<any, any, void>({
    mutationFn: () =>
      proposalProposalsDeclineContribution({
        path,
        body: { contribution_uuid: contributionUuid ?? '' },
      }),
    confirmation: {
      title: translate('Decline the contribution'),
      body: translate(
        'The contribution goes back to whoever handed it to you, who is told.',
      ),
    },
    successMessage: translate('The contribution is handed back.'),
    errorMessage: translate('Unable to decline the contribution.'),
    closeModal: false,
    refetch,
  });
  if (!contributionUuid || !task.proposal_uuid) {
    return null;
  }
  return (
    <ActionsMenu>
      <ActionItem
        title={translate('Accept')}
        action={() => accept.mutate()}
        iconNode={<CheckIcon weight="bold" />}
      />
      <ActionItem
        title={translate('Decline')}
        action={() => decline.mutate()}
        iconNode={<XIcon weight="bold" />}
        className="text-danger"
        iconColor="danger"
      />
    </ActionsMenu>
  );
};
