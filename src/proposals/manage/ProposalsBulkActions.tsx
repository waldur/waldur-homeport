import {
  ChatTextIcon,
  CheckSquareIcon,
  DownloadSimpleIcon,
  EnvelopeSimpleIcon,
} from '@phosphor-icons/react';
import { FC } from 'react';
import { Proposal } from 'waldur-js-client';

import { ButtonSize, Menu } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { downloadFile } from '@/form/upload/FileDownloader';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

import { Call } from '../types';

import { buildCallExportUrl } from './callExportUrl';

const NotifyProposalsDialog = lazyComponent(() =>
  import('./NotifyProposalsDialog').then((module) => ({
    default: module.NotifyProposalsDialog,
  })),
);

const DecideProposalStepsDialog = lazyComponent(() =>
  import('./DecideProposalStepsDialog').then((module) => ({
    default: module.DecideProposalStepsDialog,
  })),
);

const CreateManualAssignmentDialog = lazyComponent(() =>
  import('../assignments/CreateManualAssignmentDialog').then((module) => ({
    default: module.CreateManualAssignmentDialog,
  })),
);

interface BulkOptions {
  /** May assign reviewers to the call's proposals. */
  canAssignReviewers: boolean;
  /** May download the call's exports. */
  canExport: boolean;
}

/** What a call manager can do to the selected proposals of a call at once. */
export const makeProposalsBulkActions =
  (
    call: Pick<Call, 'uuid' | 'url' | 'slug'>,
    { canAssignReviewers, canExport }: BulkOptions,
  ): FC<{ rows: Proposal[]; refetch: () => void; size?: ButtonSize }> =>
  ({ rows, refetch, size = 'lg' }) => {
    const { openDialog } = useModal();
    const count = rows.length;
    const proposalUuids = rows.map((row) => row.uuid);
    const exportSelection = (
      action: 'export-proposals' | 'export-reviews',
      stateParameter: 'proposal_state' | 'review_state',
      suffix: string,
    ) =>
      downloadFile(
        buildCallExportUrl(call, action, stateParameter, {
          proposal_uuids: proposalUuids,
        }),
        `${call.slug || call.uuid}-${suffix}.csv`,
      );
    return (
      <Menu>
        <Menu.TriggerButton variant="primary" size={size}>
          {translate('All actions')}
        </Menu.TriggerButton>
        <Menu.Content look="actions" side="bottom">
          <Menu.Item
            icon={<CheckSquareIcon weight="bold" />}
            disabled={count === 0}
            onSelect={() =>
              openDialog(DecideProposalStepsDialog, {
                resolve: { proposals: rows, refetch },
              })
            }
          >
            {`${translate('Decide a step')} (${count})`}
          </Menu.Item>
          {canAssignReviewers && (
            <Menu.Item
              icon={<ChatTextIcon weight="bold" />}
              disabled={count === 0}
              onSelect={() =>
                openDialog(CreateManualAssignmentDialog, {
                  resolve: { call, refetch, initialProposals: rows },
                  size: 'md',
                })
              }
            >
              {`${translate('Assign a reviewer')} (${count})`}
            </Menu.Item>
          )}
          <Menu.Item
            icon={<EnvelopeSimpleIcon weight="bold" />}
            disabled={count === 0}
            onSelect={() =>
              openDialog(NotifyProposalsDialog, {
                resolve: { callUuid: call.uuid, proposalUuids, refetch },
              })
            }
          >
            {`${translate('Message the applicants')} (${count})`}
          </Menu.Item>
          {canExport && (
            <>
              <Menu.Item
                icon={<DownloadSimpleIcon weight="bold" />}
                disabled={count === 0}
                onSelect={() =>
                  exportSelection(
                    'export-proposals',
                    'proposal_state',
                    'selected-proposals',
                  )
                }
              >
                {`${translate('Export the proposals (CSV)')} (${count})`}
              </Menu.Item>
              <Menu.Item
                icon={<DownloadSimpleIcon weight="bold" />}
                disabled={count === 0}
                onSelect={() =>
                  exportSelection(
                    'export-reviews',
                    'review_state',
                    'selected-reviews',
                  )
                }
              >
                {`${translate('Export their reviews (CSV)')} (${count})`}
              </Menu.Item>
            </>
          )}
        </Menu.Content>
      </Menu>
    );
  };
