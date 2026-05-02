import {
  EnvelopeSimpleIcon,
  MagnifyingGlassIcon,
  PaperPlaneTiltIcon,
} from '@phosphor-icons/react';
import { FC, useCallback } from 'react';
import { proposalProtectedCallsSendInvitations } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Call } from '@/proposals/types';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useNotify } from '@/store/notify';
import { ActionsDropdownComponent } from '@/table/ActionsDropdown';

const DirectEmailInviteDialog = lazyComponent(() =>
  import('./DirectEmailInviteDialog').then((m) => ({
    default: m.DirectEmailInviteDialog,
  })),
);

const GenerateMatchesDialog = lazyComponent(() =>
  import('./GenerateMatchesDialog').then((m) => ({
    default: m.GenerateMatchesDialog,
  })),
);

interface ReviewerDiscoveryActionsProps {
  call: Call;
  refetch: () => void;
}

export const ReviewerDiscoveryActions: FC<ReviewerDiscoveryActionsProps> = ({
  call,
  refetch,
}) => {
  const { openDialog } = useModal();
  const { showSuccess, showError } = useNotify();

  const handleGenerate = useCallback(() => {
    openDialog(GenerateMatchesDialog, {
      resolve: { call, refetch },
      size: 'lg',
    });
  }, [call, refetch, openDialog]);

  const { mutate: handleSendInvitations, isPending: isSending } =
    useManagedMutation<any, any, void>({
      mutationFn: () =>
        proposalProtectedCallsSendInvitations({
          path: { uuid: call.uuid },
        }),
      onSuccess: (response) => {
        const data = response.data as { invitations_sent: number };
        if (data.invitations_sent > 0) {
          showSuccess(
            translate('Sent {count} invitations.', {
              count: data.invitations_sent,
            }),
          );
        } else {
          showError(
            translate(
              'No invitations sent. Please confirm some suggestions first.',
            ),
          );
        }
      },
      errorMessage: translate('Unable to send invitations.'),
      refetch,
    });

  const handleDirectInvite = useCallback(() => {
    openDialog(DirectEmailInviteDialog, {
      resolve: { call, refetch },
      size: 'lg',
    });
  }, [call, refetch, openDialog]);

  return (
    <ActionsDropdownComponent labeled drop="down" variant="secondary">
      <ActionItem
        title={translate('Generate matches')}
        action={handleGenerate}
        iconNode={<MagnifyingGlassIcon weight="bold" />}
      />
      <ActionItem
        title={
          isSending
            ? translate('Sending...')
            : translate('Send confirmed invitations')
        }
        action={() => handleSendInvitations()}
        disabled={isSending}
        iconNode={<PaperPlaneTiltIcon weight="bold" />}
      />
      <ActionItem
        title={translate('Invite by email')}
        action={handleDirectInvite}
        iconNode={<EnvelopeSimpleIcon weight="bold" />}
      />
    </ActionsDropdownComponent>
  );
};
