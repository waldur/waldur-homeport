import type { ArrowCustomerMapping } from 'waldur-js-client';

import { DeleteButton } from '@/core/buttons';
import { translate } from '@/i18n';

import { useDeleteCustomerMapping } from '../api';

export const CustomerMappingDeleteAction = ({
  row,
  refetch,
}: {
  row: ArrowCustomerMapping;
  refetch: () => void;
}) => {
  const deleteMapping = useDeleteCustomerMapping();

  return (
    <DeleteButton
      row={row}
      apiFunction={async (r) => {
        await deleteMapping.mutateAsync(r.uuid);
      }}
      refetch={refetch}
      confirmTitle={translate('Confirm deletion')}
      confirmMessage={translate(
        'Are you sure you want to delete this customer mapping? This will not delete any synced data.',
      )}
      title={translate('Delete')}
    />
  );
};
