import { useDispatch, useSelector } from 'react-redux';

import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { translate } from '@waldur/i18n';
import { isOfferingTypeSchedulable } from '@waldur/marketplace/common/registry';
import { ARCHIVED } from '@waldur/marketplace/offerings/store/constants';
import {
  getUser,
  isOwner as isOwnerSelector,
} from '@waldur/workspace/selectors';

import { ActionsDropdown } from '../../actions/ActionsDropdown';
import {
  googleCalendarPublish,
  googleCalendarSync,
  googleCalendarUnpublish,
} from '../../store/actions';

export const GoogleCalendarActions = ({ offering }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const isOwner = useSelector(isOwnerSelector);
  const isVisible =
    offering.type === OFFERING_TYPE_BOOKING &&
    ![ARCHIVED].includes(offering.state) &&
    isOfferingTypeSchedulable(offering.type) &&
    (user?.is_staff || isOwner);
  if (!isVisible) {
    return null;
  }
  const actions = [
    {
      label: translate('Sync with Google Calendar'),
      handler: () => dispatch(googleCalendarSync(offering.uuid)),
    },
    {
      label: translate('Publish as Google Calendar'),
      handler: () => dispatch(googleCalendarPublish(offering.uuid)),
      visible: !offering.google_calendar_is_public,
    },
    {
      label: translate('Unpublish as Google Calendar'),
      handler: () => dispatch(googleCalendarUnpublish(offering.uuid)),
      visible: offering.google_calendar_is_public,
    },
  ];
  return <ActionsDropdown actions={actions} />;
};
