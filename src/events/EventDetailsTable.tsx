import * as React from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { ExternalLink } from '@waldur/core/ExternalLink';
import { TranslateProps } from '@waldur/i18n';

import { EventField } from './EventField';
import { Event } from './types';

interface EventDetailsTableProps extends TranslateProps {
  event: Event;
  isStaffOrSupport: boolean;
}

const showLink = (event, isStaffOrSupport) =>
  event.issue_link && isStaffOrSupport;

export const EventDetailsTable = ({ translate, event, isStaffOrSupport }: EventDetailsTableProps) => (
  <table className="table table-borderless">
    <tbody>
      <EventField
        label={translate('Timestamp')}
        value={formatDateTime(event['@timestamp'])}
      />
      <EventField
        label={translate('User')}
        state="users.details"
        params={{ uuid: event.user_uuid }}
        value={event.user_full_name || event.user_username}
      />
      <EventField
        label={translate('IP address')}
        value={event.ip_address}
      />
      <EventField
        label={translate('Importance')}
        value={<span style={{ textTransform: 'capitalize' }}>{event.importance}</span>}
      />
      <EventField
        label={translate('Event type')}
        value={event.event_type}
      />
      <EventField
        label={translate('Error message')}
        value={event.error_message}
      />
      <EventField
        label={translate('Organization')}
        value={event.customer_name}
        state="organization.details"
        params={{ uuid: event.customer_uuid }}
      />
      <EventField
        label={translate('Project')}
        value={event.project_name}
        state="project.details"
        params={{ uuid: event.project_uuid }}
      />
      <EventField
        label={translate('Provider')}
        value={event.service_name}
        state="organization.providers"
        params={{
          uuid: event.customer_uuid,
          providerUuid: event.service_uuid,
          providerType: event.service_type,
        }}
      />
      <EventField
        label={translate('Resource')}
        value={event.resource_full_name}
        state="resources.details"
        params={{
          uuid: event.resource_uuid,
          resource_type: event.resource_type,
        }}
      />
      <EventField
        label={translate('Resource configuration')}
        value={event.resource_configuration}
      />
      <EventField
        label={translate('Message')}
        value={event.message}
      />
      <EventField
        label={translate('Issue link')}
        value={showLink(event, isStaffOrSupport) && <ExternalLink label={translate('Open')} url={event.issue_link}/>}
      />
    </tbody>
  </table>
);
