import {
  RequestTypeAdmin,
  supportRequestTypesAdminDestroy,
} from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

export const RequestTypeDeleteAction = ({
  row,
  refetch,
}: {
  row: RequestTypeAdmin;
  refetch: () => void;
}) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      supportRequestTypesAdminDestroy({ path: { uuid: row.uuid } }),
    successMessage: translate('Request type has been deleted.'),
    errorMessage: translate('Unable to delete request type.'),
    refetch,
    confirmation: {
      title: translate('Delete request type'),
      body: row.is_synced
        ? translate(
            'Are you sure you want to delete {name}? This is a synced request type and may be re-created on the next sync.',
            { name: <strong>{row.name}</strong> },
            formatJsxTemplate,
          )
        : translate(
            'Are you sure you want to delete {name}?',
            { name: <strong>{row.name}</strong> },
            formatJsxTemplate,
          ),
      options: { forDeletion: true },
    },
  });

  return (
    <RemovalActionItem
      title={translate('Delete')}
      action={mutate}
      disabled={isPending}
    />
  );
};
