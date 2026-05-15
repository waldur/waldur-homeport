import { EyeSlashIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { bookingOfferingsUnshareGoogleCalendar } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

interface GoogleCalendarActionProps {
  offering: any;
}

export const GoogleCalendarUnpublishAction: FC<GoogleCalendarActionProps> = ({
  offering,
}) => {
  const { mutate, isPending } = useManagedMutation<any, any, string>({
    mutationFn: (uuid) =>
      bookingOfferingsUnshareGoogleCalendar({ path: { uuid } }),
    successMessage: translate(
      'Google Calendar has been unpublished successfully.',
    ),
    errorMessage: translate('Unable to unpublish Google Calendar.'),
  });

  if (!offering.google_calendar_is_public) {
    return null;
  }

  return (
    <ActionItem
      title={translate('Unpublish as Google Calendar')}
      action={() => mutate(offering.uuid)}
      iconNode={<EyeSlashIcon weight="bold" />}
      disabled={isPending}
    />
  );
};
