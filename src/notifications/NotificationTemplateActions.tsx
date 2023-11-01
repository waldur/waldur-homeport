import { ButtonGroup } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { NotificationTemplateDeleteButton } from '@waldur/notifications/NotificationTemplateDeleteButton';
import { NotificationTemplateUpdateButton } from '@waldur/notifications/NotificationTemplateUpdateButton';
import { isOwnerOrStaff as isOwnerOrStaffSelector } from '@waldur/workspace/selectors';

export const NotificationTemplateActions = ({ row, fetch }) => {
  const isOwnerOrStaff = useSelector(isOwnerOrStaffSelector);
  if (isOwnerOrStaff) {
    return (
      <ButtonGroup>
        <NotificationTemplateUpdateButton template={row} fetch={fetch} />
        <NotificationTemplateDeleteButton row={row} refetch={fetch} />
      </ButtonGroup>
    );
  } else {
    return null;
  }
};
