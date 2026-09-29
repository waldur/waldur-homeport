import { OfferingGroup } from 'waldur-js-client';

import { ActionsDropdown } from '@/table/ActionsDropdown';

import { OfferingGroupAddOfferingAction } from './OfferingGroupAddOfferingAction';
import { OfferingGroupDeleteButton } from './OfferingGroupDeleteButton';
import { OfferingGroupEditButton } from './OfferingGroupEditButton';

interface OfferingGroupRowActionsProps {
  row: OfferingGroup;
  refetch: () => void;
  customerUrl?: string;
}

export const OfferingGroupRowActions = ({
  row,
  refetch,
  customerUrl,
}: OfferingGroupRowActionsProps) => (
  <ActionsDropdown row={row} refetch={refetch}>
    <OfferingGroupAddOfferingAction row={row} refetch={refetch} />
    <OfferingGroupEditButton
      row={row}
      refetch={refetch}
      customerUrl={customerUrl}
    />
    <OfferingGroupDeleteButton row={row} refetch={refetch} />
  </ActionsDropdown>
);
