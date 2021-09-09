import { FunctionComponent } from 'react';
import { useAsync } from 'react-use';

import { getBookingOffering } from '@waldur/booking/api';
import { translate } from '@waldur/i18n';
import { CopyToClipboard } from '@waldur/marketplace/offerings/service-providers/shared/CopyToClipboard';
import { Offering } from '@waldur/marketplace/types';
import './GoogleCalendarLink.scss';

interface GoogleCalendarLinkProps {
  offering: Offering;
}

export const GoogleCalendarLink: FunctionComponent<GoogleCalendarLinkProps> = ({
  offering,
}) => {
  const { value } = useAsync(() => getBookingOffering(offering.uuid), [
    offering,
  ]);
  return value && value.googlecalendar && value.googlecalendar.public ? (
    <div className="googleCalendarLink m-t">
      <div>
        <b>{translate('Calendar')}: </b>
        <a
          href={value.googlecalendar.http_link}
          target="_blank"
          rel="noopener noreferrer"
          className="m-l-sm m-r"
        >
          {translate('Click to see Google Calendar')}
        </a>
      </div>
      <CopyToClipboard value={value.googlecalendar.http_link} />
    </div>
  ) : null;
};
