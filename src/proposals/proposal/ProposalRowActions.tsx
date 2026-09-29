import { ChatTextIcon } from '@phosphor-icons/react';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { Call } from '@/proposals/types';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionsDropdownComponent } from '@/table/ActionsDropdown';

import {
  CreateManualAssignmentDialog,
  useCanCreateReview,
} from './create/utils';
import { DownloadProposalPdfAction } from './DownloadProposalPdfAction';
import { ReviewProposalMyselfAction } from './ReviewProposalMyselfAction';

// Decisions live on the detail page's workflow steps. What is left here is
// starting a manual review, and taking the proposal away as a document.
export const ProposalRowActions = ({ row, refetch }) => {
  const { openDialog } = useModal();

  const canCreateReview = useCanCreateReview(row);

  // Never empty now: the document is always available.
  return (
    <ActionsDropdownComponent>
      {canCreateReview && (
        <>
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
          <ReviewProposalMyselfAction row={row} refetch={refetch} />
        </>
      )}
      <DownloadProposalPdfAction proposal={row} asDropdownItem />
    </ActionsDropdownComponent>
  );
};
