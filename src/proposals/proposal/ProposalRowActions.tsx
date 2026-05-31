import {
  ChatTextIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@phosphor-icons/react';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { Call } from '@/proposals/types';
import { ActionItem } from '@/resource/actions/ActionItem';
import {
  ActionsDropdown,
  ActionsDropdownComponent,
} from '@/table/ActionsDropdown';

import {
  CreateManualAssignmentDialog,
  useCanCreateReview,
  useProposalDecisionActions,
} from './create/utils';

export const ProposalRowActions = ({ row, refetch }) => {
  const { openDialog } = useModal();

  const {
    canPerformDecisionActions,
    handleApproveProposal,
    handleRejectProposal,
  } = useProposalDecisionActions(row, refetch);

  const canCreateReview = useCanCreateReview(row);

  if (!canPerformDecisionActions && !canCreateReview) {
    return <ActionsDropdown disabled tooltip />;
  }

  return (
    <ActionsDropdownComponent>
      {canCreateReview && (
        <ActionItem
          title={translate('Create review')}
          action={() =>
            openDialog(CreateManualAssignmentDialog, {
              resolve: {
                call: { uuid: row.call_uuid } as Call,
                refetch,
                initialProposal: row,
              },
              size: 'md',
            })
          }
          iconNode={<ChatTextIcon weight="bold" />}
        />
      )}
      {canPerformDecisionActions && (
        <>
          <ActionItem
            title={translate('Approve')}
            action={handleApproveProposal}
            iconNode={<CheckCircleIcon weight="bold" />}
          />
          <ActionItem
            title={translate('Reject')}
            action={handleRejectProposal}
            iconNode={<XCircleIcon weight="bold" />}
            className="text-danger"
            iconColor="danger"
          />
        </>
      )}
    </ActionsDropdownComponent>
  );
};
