import { ButtonGroup } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { NotificationUpdateButton } from '@waldur/notifications/NotificationUpdateButton';
import { isStaff as isStaffSelector } from '@waldur/workspace/selectors';

export const NotificationActions = ({ row, refetch }) => {
  const isStaff = useSelector(isStaffSelector);
  if (isStaff) {
    return (
      <ButtonGroup>
        <NotificationUpdateButton notification={row} refetch={refetch} />
      </ButtonGroup>
    );
  } else {
    return null;
  }
};
