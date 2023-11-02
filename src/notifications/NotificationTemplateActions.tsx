import { ButtonGroup } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { NotificationTemplateDeleteButton } from '@waldur/notifications/NotificationTemplateDeleteButton';
import { NotificationTemplateUpdateButton } from '@waldur/notifications/NotificationTemplateUpdateButton';
import { isStaff as isStaffSelector } from '@waldur/workspace/selectors';

export const NotificationTemplateActions = ({ row, refetch }) => {
  const isStaff = useSelector(isStaffSelector);
  if (isStaff) {
    return (
      <ButtonGroup>
        <NotificationTemplateUpdateButton template={row} refetch={refetch} />
        <NotificationTemplateDeleteButton row={row} refetch={refetch} />
      </ButtonGroup>
    );
  } else {
    return null;
  }
};
