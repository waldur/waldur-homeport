import { FilePdfIcon } from '@phosphor-icons/react';
import { FC, useState } from 'react';

import { BaseButton } from 'waldur-ui';

import { ENV } from '@/core/config';
import { downloadFile } from '@/form/upload/FileDownloader';
import { translate } from '@/i18n';
import { Proposal } from '@/proposals/types';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useNotify } from '@/store/notify';

interface DownloadProposalPdfActionProps {
  proposal: Pick<Proposal, 'uuid' | 'slug' | 'name'> & Partial<Proposal>;
  asDropdownItem?: boolean;
}

/** The server renders the document from what the API gives the reader, so
 * the applicant team, the call team and an evaluator each get their own
 * (waldur/waldur-mastermind#681). */
const proposalPdfUrl = (uuid: string) =>
  `${ENV.apiEndpoint}api/proposal-proposals/${uuid}/pdf/`;

export const DownloadProposalPdfAction: FC<DownloadProposalPdfActionProps> = ({
  proposal,
  asDropdownItem,
}) => {
  const [preparing, setPreparing] = useState(false);
  const { showErrorResponse } = useNotify();

  const download = async () => {
    setPreparing(true);
    try {
      await downloadFile(
        proposalPdfUrl(proposal.uuid),
        `${proposal.slug || proposal.uuid}.pdf`,
      );
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
