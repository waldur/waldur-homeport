import { CallOfferingDeleteButton } from '@waldur/proposals/details/CallOfferingDeleteButton';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

export const CallOfferingRowActions = ({ row, refetch }) => {
  return (
    <ActionsDropdown
      row={row}
      refetch={refetch}
      actions={[CallOfferingDeleteButton].filter(Boolean)}
    />
  );
};
