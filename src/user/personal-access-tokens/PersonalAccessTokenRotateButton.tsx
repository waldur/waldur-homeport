import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { personalAccessTokensRotate } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

const PersonalAccessTokenSecretDialog = lazyComponent(() =>
  import('./PersonalAccessTokenSecretDialog').then((module) => ({
    default: module.PersonalAccessTokenSecretDialog,
  })),
);

export const PersonalAccessTokenRotateButton = ({ row, refetch }) => {
  const { openDialog } = useModal();

  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () => personalAccessTokensRotate({ path: { uuid: row.uuid } }),
    successMessage: translate('Token has been rotated.'),
    errorMessage: translate('Unable to rotate token.'),
    refetch,
    onSuccess: (response) => {
      openDialog(PersonalAccessTokenSecretDialog, {
        size: 'lg',
        resolve: { token: response.data.token, tokenName: response.data.name },
      });
    },
    confirmation: {
      title: translate('Rotate token'),
      body: translate(
        'Are you sure you want to rotate this token? The current token will stop working immediately and a new token will be generated.',
      ),
    },
  });

  return (
    <ActionItem
      title={translate('Rotate')}
      action={mutate}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
      disabled={isPending || !row.is_active}
      tooltip={
        !row.is_active ? translate('Cannot rotate a revoked token.') : undefined
      }
    />
  );
};
