import { FC } from 'react';
import { hooksEmailDestroy, hooksWebDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

interface HookRemoveButtonProps {
  refetch();
  row;
}

export const HookRemoveButton: FC<HookRemoveButtonProps> = ({
  row: hook,
  refetch,
}) => {
  const removeMutation = useManagedMutation<any, any, void>({
    mutationFn: async () => {
      if (hook.hook_type == 'email') {
        return await hooksEmailDestroy({
          path: { uuid: hook.uuid },
        });
      } else {
        return await hooksWebDestroy({
          path: { uuid: hook.uuid },
        });
      }
    },
    successMessage: translate('Hook has been removed.'),
    errorMessage: translate('Unable to remove hook.'),
    refetch,
    confirmation: {
      title: translate('Hook removal'),
      body: translate('Are you sure you would like to delete the hook?'),
      options: { forDeletion: true },
    },
  });

  return (
    <RemovalActionItem
      title={translate('Remove')}
      action={() => removeMutation.mutate()}
      disabled={removeMutation.isPending}
      size="sm"
    />
  );
};
