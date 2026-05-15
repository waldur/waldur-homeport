import { ShareIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { bookingOfferingsShareGoogleCalendar } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

interface GoogleCalendarActionProps {
  offering: any;
}

export const GoogleCalendarPublishAction: FC<GoogleCalendarActionProps> = ({
  offering,
}) => {
  const { mutate, isPending } = useManagedMutation<any, any, string>({
    mutationFn: (uuid) =>
      bookingOfferingsShareGoogleCalendar({ path: { uuid } }),
    successMessage: translate(
      'Google Calendar has been published successfully.',
    ),
    errorMessage: translate('Unable to publish Google Calendar.'),
  });

  if (offering.google_calendar_is_public) {
    return null;
  }

  return (
    <ActionItem
      title={translate('Publish as Google Calendar')}
      action={() => mutate(offering.uuid)}
      iconNode={<ShareIcon weight="bold" />}
      disabled={isPending}
    />
  );
};
