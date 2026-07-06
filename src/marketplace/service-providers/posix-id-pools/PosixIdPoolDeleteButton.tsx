import { marketplacePosixIdPoolsDestroy, PosixIdPool } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { useUser } from '@/workspace/hooks';

interface PosixIdPoolDeleteButtonProps {
  row: PosixIdPool;
  refetch: () => void;
}

export const PosixIdPoolDeleteButton = (
  props: PosixIdPoolDeleteButtonProps,
) => {
  const user = useUser();
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplacePosixIdPoolsDestroy({ path: { uuid: props.row.uuid! } }),
    refetch: props.refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Are you sure you want to delete the POSIX ID pool for {scope}?',
        {
          scope: (
            <strong>
              {props.row.scope === 'offering'
                ? translate('this offering')
                : translate('the service provider')}
            </strong>
          ),
        },
        formatJsxTemplate,
      ),
      options: {
        forDeletion: true,
      },
    },
    errorMessage: translate('Unable to remove POSIX ID pool.'),
  });

  if (
    !hasPermission(user, {
      permission: PermissionEnum.MANAGE_POSIX_ID_POOL,
      customerId: props.row.customer_uuid,
    })
  ) {
    return null;
  }

  return (
    <RemovalActionItem
      title={translate('Remove')}
      action={mutate}
      disabled={isPending}
    />
  );
};
