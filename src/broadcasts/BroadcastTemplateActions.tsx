import { BroadcastTemplateDeleteButton } from '@/broadcasts/BroadcastTemplateDeleteButton';
import { BroadcastTemplateUpdateButton } from '@/broadcasts/BroadcastTemplateUpdateButton';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { useUser } from '@/workspace/hooks';

export const BroadcastTemplateActions = ({ row, refetch }) => {
  const user = useUser();
  const isStaff = user?.is_staff;
  if (isStaff) {
    return (
      <ActionsDropdown
        row={row}
        refetch={refetch}
        actions={[BroadcastTemplateUpdateButton, BroadcastTemplateDeleteButton]}
      />
    );
  } else {
    return null;
  }
};
