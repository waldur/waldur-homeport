import { EnvelopeSimpleIcon } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { Call } from '@/proposals/types';
import { ActionItem } from '@/resource/actions/ActionItem';

const DirectEmailInviteDialog = lazyComponent(() =>
  import('./DirectEmailInviteDialog').then((m) => ({
    default: m.DirectEmailInviteDialog,
  })),
);

interface DirectEmailInviteActionProps {
  call: Call;
  refetch: () => void;
}

export const DirectEmailInviteAction: FC<DirectEmailInviteActionProps> = ({
  call,
  refetch,
}) => {
  const { openDialog } = useModal();

  const handleDirectInvite = useCallback(() => {
    openDialog(DirectEmailInviteDialog, {
      resolve: { call, refetch },
      size: 'lg',
    });
  }, [call, refetch, openDialog]);

  return (
    <ActionItem
      title={translate('Invite by email')}
      action={handleDirectInvite}
      iconNode={<EnvelopeSimpleIcon weight="bold" />}
    />
  );
};
