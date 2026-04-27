import type { ArrowCustomerMapping } from 'waldur-js-client';

import { ActionsDropdown } from '@/table/ActionsDropdown';

import { CustomerMappingBillingSummaryAction } from './CustomerMappingBillingSummaryAction';
import { CustomerMappingDeleteAction } from './CustomerMappingDeleteAction';
import { CustomerMappingEditAction } from './CustomerMappingEditAction';
import { CustomerMappingSyncAction } from './CustomerMappingSyncAction';
import { LinkResourcesAction } from './LinkResourcesAction';

interface CustomerMappingActionsProps {
  row: ArrowCustomerMapping;
  refetch: () => void;
}

export const CustomerMappingActions = ({
  row,
  refetch,
}: CustomerMappingActionsProps) => {
  return (
    <ActionsDropdown
      row={row}
      refetch={refetch}
      actions={[
        CustomerMappingBillingSummaryAction,
        LinkResourcesAction,
        CustomerMappingSyncAction,
        CustomerMappingEditAction,
        CustomerMappingDeleteAction,
      ].filter(Boolean)}
    />
  );
};
