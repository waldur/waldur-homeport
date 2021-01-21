import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { translate } from '@waldur/i18n';
import { ARCHIVED } from '@waldur/marketplace/offerings/store/constants';

export const googleCalendarActions = (dispatchProps, ownProps, stateProps) => [
  {
    label: translate('Sync with Google Calendar'),
    handler: () => dispatchProps.syncGoogleCalendar(ownProps.offering),
    visible:
      ownProps.offering.type === OFFERING_TYPE_BOOKING &&
      ![ARCHIVED].includes(ownProps.offering.state) &&
      stateProps.user.is_staff &&
      stateProps.isOwner,
  },
  {
    label: translate('Publish as Google Calendar'),
    handler: () => dispatchProps.publishGoogleCalendar(ownProps.offering),
    visible:
      !ownProps.offering.google_calendar_is_public &&
      ownProps.offering.type === OFFERING_TYPE_BOOKING &&
      ![ARCHIVED].includes(ownProps.offering.state) &&
      stateProps.user.is_staff &&
      stateProps.isOwner,
  },
  {
    label: translate('Unpublish as Google Calendar'),
    handler: () => dispatchProps.unpublishGoogleCalendar(ownProps.offering),
    visible:
      ownProps.offering.google_calendar_is_public &&
      ownProps.offering.type === OFFERING_TYPE_BOOKING &&
      ![ARCHIVED].includes(ownProps.offering.state) &&
      stateProps.user.is_staff &&
      stateProps.isOwner,
  },
];
