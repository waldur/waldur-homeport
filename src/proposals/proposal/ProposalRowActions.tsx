import { ChatTextIcon } from '@phosphor-icons/react';

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
} from './create/utils';

// Proposal decisions (accept/reject) are made by driving the per-proposal
// workflow steps on the proposal detail page (WorkflowStepActions); the legacy
// one-click approve/reject shortcut has been removed. The only row action left
// here is starting a manual review.
export const ProposalRowActions = ({ row, refetch }) => {
  const { openDialog } = useModal();

  const canCreateReview = useCanCreateReview(row);

  if (!canCreateReview) {
    return <ActionsDropdown disabled tooltip />;
  }

  return (
    <ActionsDropdownComponent>
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
    </ActionsDropdownComponent>
  );
};
