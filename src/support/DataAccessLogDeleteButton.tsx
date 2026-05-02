import {
  dataAccessLogsDestroy,
  GlobalUserDataAccessLog,
} from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

interface DataAccessLogDeleteButtonProps {
  row: GlobalUserDataAccessLog;
  refetch: () => void;
}

export const DataAccessLogDeleteButton = ({
  row,
  refetch,
}: DataAccessLogDeleteButtonProps) => {
  const { mutate: mutate, isPending: isPending } = useManagedMutation<
    any,
    any,
    void
  >({
    mutationFn: () => dataAccessLogsDestroy({ path: { uuid: row.uuid } }),
    refetch: refetch,

    confirmation: {
      title: translate('Confirmation'),

      body: translate(
        'Are you sure you want to delete the data access log for user {name}?',
        { name: <strong>{row.user.full_name || row.user.username}</strong> },
        formatJsxTemplate,
      ),

      options: {
        forDeletion: true,
      },
    },

    errorMessage: translate('Unable to remove data access log.'),
  });

  return (
    <RemovalActionItem
      title={translate('Remove')}
      action={mutate}
      disabled={isPending}
    />
  );
};
