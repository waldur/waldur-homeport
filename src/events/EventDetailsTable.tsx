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

export const EventDetailsTable = ({
  translate,
  event,
  isStaffOrSupport,
}: EventDetailsTableProps) => (
  <table className="table table-borderless">
    <tbody>
      <EventField
        label={translate('Timestamp')}
        value={formatDateTime(event.created)}
      />
      <EventField
        label={translate('User')}
        state="users.details"
        params={{ uuid: event.context.user_uuid }}
        value={event.context.user_full_name || event.context.user_username}
      />
      <EventField
        label={translate('IP address')}
        value={event.context.ip_address}
      />
      <EventField label={translate('Event type')} value={event.event_type} />
      <EventField
        label={translate('Error message')}
        value={event.context.error_message}
      />
      <EventField
        label={translate('Organization')}
        value={event.context.customer_name}
        state="organization.details"
        params={{ uuid: event.context.customer_uuid }}
      />
      <EventField
        label={translate('Project')}
        value={event.context.project_name}
        state="project.details"
        params={{ uuid: event.context.project_uuid }}
      />
      <EventField
        label={translate('Provider')}
        value={event.context.service_name}
      />
      <EventField
        label={translate('Resource')}
        value={event.context.resource_full_name}
        state="resources.details"
        params={{
          uuid: event.context.resource_uuid,
          resource_type: event.context.resource_type,
        }}
      />
      <EventField
        label={translate('Resource configuration')}
        value={event.context.resource_configuration}
      />
      <EventField label={translate('Message')} value={event.message} />
      <EventField
        label={translate('Issue link')}
        value={
          showLink(event, isStaffOrSupport) && (
            <ExternalLink
              label={translate('Open')}
              url={event.context.issue_link}
            />
          )
        }
      />
    </tbody>
  </table>
);
