import { FC } from 'react';
import { useSelector } from 'react-redux';

import { OFFERING_TYPE_BOOKING } from '@/booking/constants';
import { translate } from '@/i18n';
import { isOfferingTypeSchedulable } from '@/marketplace/common/registry';
import { ARCHIVED } from '@/marketplace/offerings/store/constants';
import { ActionsDropdownComponent } from '@/table/ActionsDropdown';
import { useUser } from '@/workspace/hooks';
import { isOwner as isOwnerSelector } from '@/workspace/selectors';

import { GoogleCalendarPublishAction } from './GoogleCalendarPublishAction';
import { GoogleCalendarSyncAction } from './GoogleCalendarSyncAction';
import { GoogleCalendarUnpublishAction } from './GoogleCalendarUnpublishAction';

interface GoogleCalendarActionsProps {
  offering: any;
}

export const GoogleCalendarActions: FC<GoogleCalendarActionsProps> = ({
  offering,
}) => {
  const user = useUser();
  const isOwner = useSelector(isOwnerSelector);
  const isVisible =
    offering.type === OFFERING_TYPE_BOOKING &&
    ![ARCHIVED].includes(offering.state) &&
    isOfferingTypeSchedulable(offering.type) &&
    (user?.is_staff || isOwner);

  if (!isVisible) {
    return null;
  }

  return (
    <ActionsDropdownComponent
      label={translate('Google Calendar')}
      labeled
      variant="tertiary"
    >
      <GoogleCalendarSyncAction offering={offering} />
      <GoogleCalendarPublishAction offering={offering} />
      <GoogleCalendarUnpublishAction offering={offering} />
    </ActionsDropdownComponent>
  );
};
