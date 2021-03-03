import { FunctionComponent } from 'react';
import { useAsync } from 'react-use';

import { getBookingOffering } from '@waldur/booking/api';
import { CopyToClipboardContainer } from '@waldur/core/CopyToClipboardContainer';
import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';
import { Field } from '@waldur/resource/summary';
import { ResourceDetailsTable } from '@waldur/resource/summary/ResourceDetailsTable';

import './GoogleCalendarLinkField.scss';

interface GoogleCalendarLinkFieldProps {
  offering: Offering;
}

const googleCalendarLink = (link: string) => {
  const value = link;
  const content = (
    <a href={link} target="_blank" rel="noopener noreferrer">
      {value}
    </a>
  );
  return <CopyToClipboardContainer value={value} label={content} />;
};

export const GoogleCalendarLinkField: FunctionComponent<GoogleCalendarLinkFieldProps> = ({
  offering,
}) => {
  const { value } = useAsync(() => getBookingOffering(offering.uuid), [
    offering,
  ]);
  return value && value.googlecalendar && value.googlecalendar.public ? (
    <ResourceDetailsTable>
      <div className="m-t-n google-calendar-link-field-container">
        <Field
          label={translate('Google Calendar link')}
          value={googleCalendarLink(value.googlecalendar.http_link)}
        />
      </div>
    </ResourceDetailsTable>
  ) : null;
};
