import { EnvelopeSimpleIcon } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { Call } from '@/proposals/types';

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
    <BaseButton
      onClick={handleInviteByEmail}
      label={translate('Invite by email')}
      iconNode={<EnvelopeSimpleIcon weight="bold" />}
      variant="primary"
      size="lg"
    />
  );
};
