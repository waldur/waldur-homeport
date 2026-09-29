import { FilePdfIcon } from '@phosphor-icons/react';
import { FC, useState } from 'react';
import {
  proposalProposalsListUsersList,
  proposalProposalsResourcesList,
  RequestedResource,
  UserRoleDetails,
} from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { translate } from '@/i18n';
import { Proposal } from '@/proposals/types';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useNotify } from '@/store/notify';

import { downloadProposalPdf } from './proposalPdf';

interface DownloadProposalPdfActionProps {
  proposal: Pick<Proposal, 'uuid' | 'slug' | 'name'> & Partial<Proposal>;
  asDropdownItem?: boolean;
}

/** Fetches on click, not on render: this also sits in row actions, where a
 * hook would cost two requests per row. */
export const DownloadProposalPdfAction: FC<DownloadProposalPdfActionProps> = ({
  proposal,
  asDropdownItem,
}) => {
  const [preparing, setPreparing] = useState(false);
  const { showErrorResponse } = useNotify();

  const download = async () => {
    setPreparing(true);
    try {
      const [resources, team] = await Promise.all([
        getAllPages<RequestedResource>((page) =>
          proposalProposalsResourcesList({
            path: { uuid: proposal.uuid },
            query: { page, page_size: MAX_PAGE_SIZE } as any,
          }),
        ),
        getAllPages<UserRoleDetails>((page) =>
          proposalProposalsListUsersList({
            path: { uuid: proposal.uuid },
            query: { page, page_size: MAX_PAGE_SIZE } as any,
          }),
        ),
      ]);
      await downloadProposalPdf(proposal as Proposal, resources, team);
    } catch (error) {
      showErrorResponse(error, translate('Unable to export the proposal.'));
    } finally {
      setPreparing(false);
    }
  };

  return asDropdownItem ? (
    <ActionItem
      title={translate('Download PDF')}
      action={download}
      iconNode={<FilePdfIcon weight="bold" />}
      disabled={preparing}
      tooltip={preparing ? translate('Preparing the document...') : undefined}
    />
  ) : (
    <BaseButton
      variant="tertiary"
      size="lg"
      onClick={download}
      iconNode={<FilePdfIcon weight="bold" />}
      label={translate('Download PDF')}
      pending={preparing}
      disabled={preparing}
      disabledReason={translate('Preparing the document...')}
    />
  );
};
