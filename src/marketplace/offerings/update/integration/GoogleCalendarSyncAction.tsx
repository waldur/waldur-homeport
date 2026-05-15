import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { bookingOfferingsGoogleCalendarSync } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

interface GoogleCalendarActionProps {
  offering: any;
}

export const GoogleCalendarSyncAction: FC<GoogleCalendarActionProps> = ({
  offering,
}) => {
  const { mutate, isPending } = useManagedMutation<any, any, string>({
    mutationFn: (uuid) =>
      bookingOfferingsGoogleCalendarSync({ path: { uuid } }),
    successMessage: translate('Google Calendar has been synced successfully.'),
    errorMessage: translate('Unable to sync Google Calendar.'),
  });

  return (
    <ActionItem
      title={translate('Sync with Google Calendar')}
      action={() => mutate(offering.uuid)}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
      disabled={isPending}
    />
  );
};
