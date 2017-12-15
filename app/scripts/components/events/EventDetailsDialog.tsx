import * as moment from 'moment';
import * as React from 'react';
import { connect } from 'react-redux';

import { $state } from '@waldur/core/services';
import { TranslateProps, withTranslation, Translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { connectAngularComponent } from '@waldur/store/connect';

import { Event } from './types';

interface TableRowProps {
  title?: string;
  children?: React.ReactNode;
}

const TableRow = (props: TableRowProps) => (
  <tr>
    <td>
      <span>{props.title}</span>
    </td>
    <td>
      {props.children}
    </td>
  </tr>
);

interface Props extends TranslateProps {
  resolve: { event: Event };
  dismiss(): void;
}

const getTable = (event: Event, translate: Translate) => {
  return (
    <table className="table table-borderless">
      <tbody>
        <TableRow title={translate('Timestamp')}>{moment(event['@timestamp']).format('YYYY-MM-DD HH:mm')}</TableRow>
        {event.user_uuid && (
          <TableRow title={translate('User')}>
            <a href={$state.href('users.details', { uuid: event.user_uuid })}>
              {event.user_full_name || event.user_username }
            </a>
          </TableRow>
        )}
        {event.ip_address && (
          <TableRow title={translate('IP address')}>{event.ip_address}</TableRow>
        )}
        <TableRow title={translate('Importance')}><span style={{ textTransform: 'capitalize' }}>{event.importance}</span></TableRow>
        <TableRow title={translate('Event type')}>{event.event_type}</TableRow>
        {event.error_message && (
          <TableRow title={translate('Error message')}>{event.error_message}</TableRow>
        )}
        {event.customer_uuid && (
          <TableRow title={translate('Organization')}>
            <a href={$state.href('organization.details', { uuid: event.customer_uuid })}>
              {event.customer_name}
            </a>
          </TableRow>
        )}
        {event.project_uuid && (
          <TableRow title={translate('Project')}>
            <a href={$state.href('project.details', { uuid: event.project_uuid })}>
              {event.project_name}
            </a>
          </TableRow>
        )}
        {event.service_name && (
          <TableRow title={translate('Service')}>
            <a href={$state.href('organization.providers', {
                  uuid: event.customer_uuid,
                  providerUuid: event.service_uuid,
                  providerType: event.service_type,
                })}>
              {event.service_name}
            </a>
          </TableRow>
        )}
        {event.resource_uuid && (
          <TableRow title={translate('Resource')}>
            <a href={$state.href('resources.details', {
              uuid: event.resource_uuid,
              resource_type: event.resource_type,
            })}>
              {event.resource_full_name}
            </a>
          </TableRow>
        )}
        {event.resource_configuration && (
          <TableRow title={translate('Resource configuration')}>{event.resource_configuration}</TableRow>
        )}
        {event.message && (
          <TableRow title={translate('Message')}>{event.message}</TableRow>
        )}
        {event.link && (
          <TableRow title={translate('Issue link')}>{event.issue_link}</TableRow>
        )}
      </tbody>
    </table>);
};

const PureEventDetailsDialog = (props: Props) => {
  if (!props.resolve) {
    throw Error('The "resolve" prop must be provided');
  }

  const table = getTable(props.resolve.event, props.translate);
  const footer = (
    <button className="btn btn-default" onClick={props.dismiss}>
      <span>{props.translate('OK')}</span>
    </button>
  );

  return (
    <ModalDialog title={props.translate('Event details')} footer={footer} >
      {table}
    </ModalDialog>
  );
};

const mapDispatchToProps = dispatch => ({
  dismiss: () => dispatch(closeModalDialog()),
});

const EventDetailsDialog = withTranslation(connect(undefined, mapDispatchToProps)(PureEventDetailsDialog));

export {
  PureEventDetailsDialog,
  EventDetailsDialog,
};

export default connectAngularComponent(EventDetailsDialog, ['resolve']);
