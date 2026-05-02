import { useSelector } from 'react-redux';
import {
  bookingOfferingsGoogleCalendarSync,
  bookingOfferingsShareGoogleCalendar,
  bookingOfferingsUnshareGoogleCalendar,
} from 'waldur-js-client';

import { OFFERING_TYPE_BOOKING } from '@/booking/constants';
import { translate } from '@/i18n';
import { isOfferingTypeSchedulable } from '@/marketplace/common/registry';
import { ARCHIVED } from '@/marketplace/offerings/store/constants';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useUser } from '@/workspace/hooks';
import { isOwner as isOwnerSelector } from '@/workspace/selectors';

import { ActionsDropdown } from '../../actions/ActionsDropdown';

const useGoogleCalendarSync = () => {
  return useManagedMutation<any, any, string>({
    mutationFn: (uuid) =>
      bookingOfferingsGoogleCalendarSync({ path: { uuid } }),
    successMessage: translate('Google Calendar has been synced successfully.'),
    errorMessage: translate('Unable to sync Google Calendar.'),
  });
};

const useGoogleCalendarPublish = () => {
  return useManagedMutation<any, any, string>({
    mutationFn: (uuid) =>
      bookingOfferingsShareGoogleCalendar({ path: { uuid } }),
    successMessage: translate(
      'Google Calendar has been published successfully.',
    ),
    errorMessage: translate('Unable to publish Google Calendar.'),
  });
};

const useGoogleCalendarUnpublish = () => {
  return useManagedMutation<any, any, string>({
    mutationFn: (uuid) =>
      bookingOfferingsUnshareGoogleCalendar({ path: { uuid } }),
    successMessage: translate(
      'Google Calendar has been unpublished successfully.',
    ),
    errorMessage: translate('Unable to unpublish Google Calendar.'),
  });
};

export const GoogleCalendarActions = ({ offering }) => {
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
  const googleCalendarSync = useGoogleCalendarSync();
  const googleCalendarPublish = useGoogleCalendarPublish();
  const googleCalendarUnpublish = useGoogleCalendarUnpublish();
  const actions = [
    {
      label: translate('Sync with Google Calendar'),
      handler: () => googleCalendarSync.mutate(offering.uuid),
    },
    {
      label: translate('Publish as Google Calendar'),
      handler: () => googleCalendarPublish.mutate(offering.uuid),
      visible: !offering.google_calendar_is_public,
    },
    {
      label: translate('Unpublish as Google Calendar'),
      handler: () => googleCalendarUnpublish.mutate(offering.uuid),
      visible: offering.google_calendar_is_public,
    },
  ];

  return <ActionsDropdown actions={actions} />;
};
