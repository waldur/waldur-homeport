import { ActionsDropdown } from '@/table/ActionsDropdown';
import { useUser } from '@/workspace/hooks';

import { NotificationToggleButton } from './NotificationToggleButton';
import { NotificationUpdateButton } from './NotificationUpdateButton';

export const NotificationActions = ({ row, refetch }) => {
  const user = useUser();
  const isStaff = user?.is_staff;
  if (isStaff) {
    return (
      <ActionsDropdown
        row={row}
        refetch={refetch}
        actions={[NotificationUpdateButton, NotificationToggleButton]}
      />
    );
  } else {
    return null;
  }
};
