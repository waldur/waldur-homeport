import * as React from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { $state } from '@waldur/core/services';
import { Translate } from '@waldur/i18n';

import { Event } from './types';

interface EventField {
  key: string;
  title: string;
  href?: (event: Event) => string;
  render?: (event: Event) => React.ReactNode;
}

const getFields: (translate: Translate) => EventField[] = translate => [
  {
    key: '@timestamp',
    title: translate('Timestamp'),
    render: event => formatDateTime(event['@timestamp']),
  },
  {
    key: 'username',
    title: translate('User'),
    href: event => $state.href('users.details', { uuid: event.user_uuid }),
    render: event => event.user_full_name || event.user_username,
  },
  {
    key: 'ip_address',
    title: translate('IP address'),
  },
  {
    key: 'importance',
    title: translate('Importance'),
    render: event => <span style={{ textTransform: 'capitalize' }}>{event.importance}</span>,
  },
  {
    key: 'event_type',
    title: translate('Event type'),
  },
  {
    key: 'error_message',
    title: translate('Error message'),
  },
  {
    key: 'customer_name',
    title: translate('Organization'),
    href: event => $state.href('organization.details', { uuid: event.customer_uuid }),
  },
  {
    key: 'project_name',
    title: translate('Project'),
    href: event => $state.href('project.details', { uuid: event.project_uuid }),
  },
  {
    key: 'service_name',
    title: translate('Provider'),
    href: event => $state.href('organization.providers', {
      uuid: event.customer_uuid,
      providerUuid: event.service_uuid,
      providerType: event.service_type,
    }),
  },
  {
    key: 'resource_full_name',
    title: translate('Resource'),
    href: event => $state.href('resources.details', {
      uuid: event.resource_uuid,
      resource_type: event.resource_type,
    }),
  },
  {
    key: 'resource_configuration',
    title: translate('Resource configuration'),
  },
  {
    key: 'message',
    title: translate('Message'),
  },
  {
    key: 'issue_link',
    title: translate('Issue link'),
  },
];

const renderField = (field: EventField, event: Event) => {
  const renderValue = () => (
    field.render ?
      field.render(event) :
      event[field.key]
  );
  return (
    field.href ?
      <a href={field.href(event)}>{renderValue()}</a> :
      renderValue()
  );
};

interface Props {
  event: Event;
  translate: Translate;
}

export const EventDetailsTable = ({event, translate}: Props) => {
  const fields = getFields(translate).filter(field => event[field.key] !== undefined);
  const rows = fields.map(field =>
    <tr key={field.key}>
      <td>{field.title}</td>
      <td>{renderField(field, event)}</td>
    </tr>
  );
  return (
    <table className="table table-borderless">
      <tbody>{rows}</tbody>
    </table>
  );
};
