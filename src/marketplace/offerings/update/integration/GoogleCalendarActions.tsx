import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  bookingOfferingsGoogleCalendarSync,
  bookingOfferingsShareGoogleCalendar,
  bookingOfferingsUnshareGoogleCalendar,
} from 'waldur-js-client';

import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { translate } from '@waldur/i18n';
import { isOfferingTypeSchedulable } from '@waldur/marketplace/common/registry';
import { ARCHIVED } from '@waldur/marketplace/offerings/store/constants';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { useUser } from '@waldur/workspace/hooks';
import { isOwner as isOwnerSelector } from '@waldur/workspace/selectors';

import { ActionsDropdown } from '../../actions/ActionsDropdown';

const useGoogleCalendarSync = () => {
  const dispatch = useDispatch();

  return useCallback(
    async (uuid: string) => {
      try {
        await bookingOfferingsGoogleCalendarSync({ path: { uuid } });
        dispatch(
          showSuccess(
            translate('Google Calendar has been synced successfully.'),
          ),
        );
        dispatch(closeModalDialog());
      } catch (error) {
        dispatch(
          showErrorResponse(
            error,
            translate('Unable to sync Google Calendar.'),
          ),
        );
      }
    },
    [dispatch],
  );
};

const useGoogleCalendarPublish = () => {
  const dispatch = useDispatch();

  return useCallback(
    async (uuid: string) => {
      try {
        await bookingOfferingsShareGoogleCalendar({ path: { uuid } });
        dispatch(
          showSuccess(
            translate('Google Calendar has been published successfully.'),
          ),
        );
        dispatch(closeModalDialog());
      } catch (error) {
        dispatch(
          showErrorResponse(
            error,
            translate('Unable to publish Google Calendar.'),
          ),
        );
      }
    },
    [dispatch],
  );
};

const useGoogleCalendarUnpublish = () => {
  const dispatch = useDispatch();

  return useCallback(
    async (uuid: string) => {
      try {
        await bookingOfferingsUnshareGoogleCalendar({ path: { uuid } });
        dispatch(
          showSuccess(
            translate('Google Calendar has been unpublished successfully.'),
          ),
        );
        dispatch(closeModalDialog());
      } catch (error) {
        dispatch(
          showErrorResponse(
            error,
            translate('Unable to unpublish Google Calendar.'),
          ),
        );
      }
    },
    [dispatch],
  );
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
      handler: () => googleCalendarSync(offering.uuid),
    },
    {
      label: translate('Publish as Google Calendar'),
      handler: () => googleCalendarPublish(offering.uuid),
      visible: !offering.google_calendar_is_public,
    },
    {
      label: translate('Unpublish as Google Calendar'),
      handler: () => googleCalendarUnpublish(offering.uuid),
      visible: offering.google_calendar_is_public,
    },
  ];

  return <ActionsDropdown actions={actions} />;
};
