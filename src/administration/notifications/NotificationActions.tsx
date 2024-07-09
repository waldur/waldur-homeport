import { useSelector } from 'react-redux';

import { isStaff as isStaffSelector } from '@waldur/workspace/selectors';

import { NotificationToggleButton } from './NotificationToggleButton';
import { NotificationUpdateButton } from './NotificationUpdateButton';

export const NotificationActions = ({ row, refetch }) => {
  const isStaff = useSelector(isStaffSelector);
  if (isStaff) {
    return (
      <>
        <NotificationUpdateButton notification={row} refetch={refetch} />
        <NotificationToggleButton notification={row} refetch={refetch} />
      </>
    );
  } else {
    return null;
  }
};
