import { CallOfferingDeleteButton } from '@/proposals/details/CallOfferingDeleteButton';
import { ActionsDropdown } from '@/table/ActionsDropdown';

export const CallOfferingRowActions = ({ row, refetch }) => {
  return (
    <ActionsDropdown
      row={row}
      refetch={refetch}
      actions={[CallOfferingDeleteButton].filter(Boolean)}
    />
  );
};
