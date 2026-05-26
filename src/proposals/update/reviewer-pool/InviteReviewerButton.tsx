import { EnvelopeSimpleIcon } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { Call } from '@/proposals/types';
import { ActionButton } from '@/table/ActionButton';

const DirectEmailInviteDialog = lazyComponent(() =>
  import('@/proposals/manage/reviewer-discovery/DirectEmailInviteDialog').then(
    (m) => ({
      default: m.DirectEmailInviteDialog,
    }),
  ),
);

interface InviteReviewerButtonProps {
  call: Call;
  refetch: () => void;
}

export const InviteReviewerButton: FC<InviteReviewerButtonProps> = ({
  call,
  refetch,
}) => {
  const { openDialog } = useModal();

  const handleInviteByEmail = useCallback(() => {
    openDialog(DirectEmailInviteDialog, {
      resolve: { call, refetch },
      size: 'lg',
    });
  }, [call, refetch, openDialog]);

  return (
    <ActionButton
      action={handleInviteByEmail}
      title={translate('Invite by email')}
      iconNode={<EnvelopeSimpleIcon weight="bold" />}
      variant="primary"
    />
  );
};
