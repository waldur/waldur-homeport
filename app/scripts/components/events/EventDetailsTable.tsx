import * as moment from 'moment';
import * as React from 'react';

import { $state } from '@waldur/core/services';
import { gettext } from '@waldur/i18n';

import { Event } from './types';

interface EventField {
  key: string;
  title: string;
  href?: (event: Event) => string;
}

const FIELDS: EventField[] = [
  {
    key: 'timestamp',
    title: gettext('Timestamp'),
  },
  {
    key: 'username',
    title: gettext('User'),
    href: event => $state.href('users.details', { uuid: event.user_uuid }),
  },
  {
    key: 'ip_address',
    title: gettext('IP address'),
  },
  {
    key: 'importance',
    title: gettext('Importance'),
  },
  {
    key: 'event_type',
    title: gettext('Event type'),
  },
  {
    key: 'error_message',
    title: gettext('Error message'),
  },
  {
    key: 'customer_name',
    title: gettext('Organization'),
    href: event => $state.href('organization.details', { uuid: event.customer_uuid }),
  },
  {
    key: 'project_name',
    title: gettext('Project'),
    href: event => $state.href('project.details', { uuid: event.project_uuid }),
  },
  {
    key: 'service_name',
    title: gettext('Provider'),
    href: event => $state.href('organization.providers', {
      uuid: event.customer_uuid,
      providerUuid: event.service_uuid,
      providerType: event.service_type,
    }),
  },
  {
    key: 'resource_full_name',
    title: gettext('Resource'),
    href: event => $state.href('resources.details', {
      uuid: event.resource_uuid,
      resource_type: event.resource_type,
    }),
  },
  {
    key: 'resource_configuration',
    title: gettext('Resource configuration'),
  },
  {
    key: 'message',
    title: gettext('Message'),
  },
  {
    key: 'issue_link',
    title: gettext('Issue link'),
  },
];

const formatEvent = (event: Event) => ({
  ...event,
  timestamp: moment(event['@timestamp']).format('YYYY-MM-DD HH:mm'),
  username: event.user_full_name || event.user_username,
  importance: event.importance.toUpperCase(),
});

const renderField = (field: EventField, event: Event) => (
  field.href ?
    <a href={field.href(event)}>{event[field.key]}</a> :
    event[field.key]
);

export const EventDetailsTable = ({event}: {event: Event}) => {
  const data = formatEvent(event);
  const fields = FIELDS.filter(field => data.hasOwnProperty(field.key));
  const rows = fields.map(field =>
    <tr key={field.key}>
      <td>{field.title}</td>
      <td>{renderField(field, data)}</td>
    </tr>
  );
  return (
    <table className="table table-borderless">
      <tbody>{rows}</tbody>
    </table>
  );
};
