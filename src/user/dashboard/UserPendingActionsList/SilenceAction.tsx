import { BellSlashIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { UserAction, userActionsSilence } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useNotify } from '@/store/notify';

export const SilenceAction: FC<{ row: UserAction; refetch?: () => void }> = ({
  row,
  refetch,
}) => {
  const { showErrorResponse } = useNotify();

  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () => userActionsSilence({ path: { uuid: row.uuid as any } }),
    successMessage: translate('Action has been silenced successfully.'),
    refetch,
    onError: (e: any) => {
      if (e.response?.status === 404) {
        showErrorResponse(
          e,
          translate('Action not found or no longer available.'),
        );
      } else {
        showErrorResponse(e, translate('Unable to silence action.'));
      }
    },
  });

  return (
    <ActionItem
      title={translate('Mute')}
      action={mutate}
      disabled={isPending}
      iconNode={<BellSlashIcon weight="bold" />}
    />
  );
};
