import { useMutation } from '@tanstack/react-query';
import {
  adminArrowVendorOfferingMappingsDestroy,
  ArrowVendorOfferingMapping,
} from 'waldur-js-client';

import { DeleteButton } from '@waldur/core/buttons';
import { translate } from '@waldur/i18n';

export const VendorOfferingMappingDeleteAction = ({
  row,
  refetch,
}: {
  row: ArrowVendorOfferingMapping;
  refetch: () => void;
}) => {
  const { mutateAsync } = useMutation({
    mutationFn: (uuid: string) =>
      adminArrowVendorOfferingMappingsDestroy({ path: { uuid } }),
  });

  return (
    <DeleteButton
      row={row}
      apiFunction={async (r) => {
        await mutateAsync(r.uuid);
      }}
      refetch={refetch}
      confirmTitle={translate('Confirm deletion')}
      confirmMessage={translate(
        'Are you sure you want to delete the mapping for "{vendor}"?',
        { vendor: row.arrow_vendor_name },
      )}
      title={translate('Delete')}
    />
  );
};
