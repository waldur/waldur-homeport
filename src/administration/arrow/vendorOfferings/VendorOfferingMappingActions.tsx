import type { ArrowVendorOfferingMapping } from 'waldur-js-client';

import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

import { VendorOfferingMappingDeleteAction } from './VendorOfferingMappingDeleteAction';
import { VendorOfferingMappingEditAction } from './VendorOfferingMappingEditAction';
import { VendorOfferingMappingToggleActiveAction } from './VendorOfferingMappingToggleActiveAction';

interface VendorOfferingMappingActionsProps {
  row: ArrowVendorOfferingMapping;
  refetch: () => void;
}

export const VendorOfferingMappingActions = ({
  row,
  refetch,
}: VendorOfferingMappingActionsProps) => {
  return (
    <ActionsDropdown
      row={row}
      refetch={refetch}
      actions={[
        VendorOfferingMappingEditAction,
        VendorOfferingMappingToggleActiveAction,
        VendorOfferingMappingDeleteAction,
      ]}
    />
  );
};
