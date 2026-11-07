import { EyeIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { Proposal } from '@/proposals/types';

const ProposalPreviewDialog = lazyComponent(() =>
  import('./ProposalPreviewDialog').then((module) => ({
    default: module.ProposalPreviewDialog,
  })),
);

/** "Preview as…": the proposal page as each role of its call sees it. */
export const ProposalPreviewAction: FC<{ proposal: Proposal }> = ({
  proposal,
}) => {
  const { openDialog } = useModal();
  return (
    <BaseButton
      variant="tertiary"
      label={translate('Preview as…')}
      iconNode={<EyeIcon weight="bold" />}
      onClick={() =>
        openDialog(ProposalPreviewDialog, {
          resolve: { proposalUuid: proposal.uuid, proposalName: proposal.name },
          size: 'xl',
        })
      }
    />
  );
};
