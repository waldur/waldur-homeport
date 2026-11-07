import { ChatTextIcon, EnvelopeSimpleIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { Call } from '@/proposals/types';
import { canUpdateCall } from '@/proposals/utils';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionsMenu } from '@/table/ActionsDropdown';
import { useUser } from '@/workspace/hooks';

import {
  CreateManualAssignmentDialog,
  useReviewerAssignment,
} from './create/utils';
import { DownloadProposalPdfAction } from './DownloadProposalPdfAction';
import { ReviewProposalMyselfAction } from './ReviewProposalMyselfAction';

const NotifyProposalsDialog = lazyComponent(() =>
  import('@/proposals/manage/NotifyProposalsDialog').then((module) => ({
    default: module.NotifyProposalsDialog,
  })),
);

// Decisions live on the detail page's workflow steps. What is left here is
// assigning a reviewer, writing to the applicants, and taking the proposal
// away as a document.
export const ProposalRowActions = ({ row, refetch }) => {
  const { openDialog } = useModal();
  const user = useUser();

  // Those managing the call's reviews see the action; while the proposal
  // cannot take a reviewer, it says why.
  const { canManage: canAssign, blocker } = useReviewerAssignment(row);
  // The call's managers write to its applicants, as from the selection.
  const canMessage = canUpdateCall(user, {
    uuid: row.call_uuid,
    manager_uuid: row.call_managing_organisation_uuid,
  } as Call);

  // Never empty now: the document is always available.
  return (
    <ActionsMenu>
      {canAssign && (
        <>
          <ActionItem
            title={translate('Assign reviewer')}
            disabled={Boolean(blocker)}
            tooltip={blocker ?? undefined}
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
          {!blocker && (
            <ReviewProposalMyselfAction row={row} refetch={refetch} />
          )}
        </>
      )}
      {canMessage && (
        <ActionItem
          title={translate('Message the applicants')}
          action={() =>
            openDialog(NotifyProposalsDialog, {
              resolve: {
                callUuid: row.call_uuid,
                proposalUuids: [row.uuid],
                proposalName: row.name,
                refetch,
              },
            })
          }
          iconNode={<EnvelopeSimpleIcon weight="bold" />}
        />
      )}
      <DownloadProposalPdfAction proposal={row} asDropdownItem />
    </ActionsMenu>
  );
};
