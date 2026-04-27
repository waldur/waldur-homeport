import { CheckCircleIcon, XCircleIcon } from '@phosphor-icons/react';

import { translate } from '@/i18n';
import { ActionItem } from '@/resource/actions/ActionItem';
import {
  ActionsDropdown,
  ActionsDropdownComponent,
} from '@/table/ActionsDropdown';

import { useProposalDecisionActions } from './create/utils';

export const ProposalRowActions = ({ row, refetch }) => {
  const {
    canPerformDecisionActions,
    handleApproveProposal,
    handleRejectProposal,
  } = useProposalDecisionActions(row, refetch);

  if (!canPerformDecisionActions) {
    return <ActionsDropdown disabled tooltip />;
  }

  return (
    <ActionsDropdownComponent>
      <ActionItem
        title={translate('Approve')}
        action={handleApproveProposal}
        iconNode={<CheckCircleIcon weight="bold" />}
        disabled={!canPerformDecisionActions}
      />

      <ActionItem
        title={translate('Reject')}
        action={handleRejectProposal}
        iconNode={<XCircleIcon weight="bold" />}
        disabled={!canPerformDecisionActions}
        className="text-danger"
        iconColor="danger"
      />
    </ActionsDropdownComponent>
  );
};
