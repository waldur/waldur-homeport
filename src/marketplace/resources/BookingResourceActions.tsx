import { FunctionComponent } from 'react';
import { DropdownButton } from 'react-bootstrap';
import { useBoolean } from 'react-use';

import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { translate } from '@waldur/i18n';
import { CancelAction } from '@waldur/marketplace/resources/CancelAction';
import { Resource } from '@waldur/marketplace/resources/types';

interface BookingResourceActionsProps {
  resource: Resource;
}

export const BookingResourceActions: FunctionComponent<BookingResourceActionsProps> = ({
  resource,
}) => {
  const [open, onToggle] = useBoolean(false);
  return resource.offering_type === OFFERING_TYPE_BOOKING ? (
    <div
      className="pull-right m-r-md"
      style={{ position: 'relative', zIndex: 100 }}
    >
      <DropdownButton
        title={translate('Actions')}
        id="booking-resource-actions-dropdown-btn"
        className="dropdown-btn"
        onToggle={onToggle}
        open={open}
      >
        <CancelAction resource={resource} />
      </DropdownButton>
    </div>
  ) : null;
};
