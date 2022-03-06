import { FunctionComponent } from 'react';

import { ExternalLink } from '@waldur/core/ExternalLink';
import { TranslateProps } from '@waldur/i18n';

import { ExpandableEventField } from './ExpandableEventField';
import { Event } from './types';

import './ExpandableEventDetailsTable.scss';

interface ExpandableEventDetailsTableProps extends TranslateProps {
  event: Event;
  isStaffOrSupport: boolean;
}

const showLink = (event, isStaffOrSupport) =>
  event.issue_link && isStaffOrSupport;

export const ExpandableEventDetailsTable: FunctionComponent<ExpandableEventDetailsTableProps> =
  ({ translate, event, isStaffOrSupport }) => (
    <dl className="dl-horizontal event-details-table">
      {isStaffOrSupport ? (
        <ExpandableEventField
          label={translate('User')}
          state="users.details"
          params={{ uuid: event.context.user_uuid }}
          value={event.context.user_full_name || event.context.user_username}
        />
      ) : (
        <ExpandableEventField
          label={translate('User')}
          value={event.context.user_full_name || event.context.user_username}
        />
      )}
      <ExpandableEventField
        label={translate('IP address')}
        value={event.context.ip_address}
      />
      <ExpandableEventField
        label={translate('Event type')}
        value={event.event_type}
      />
      <ExpandableEventField
        label={translate('Error message')}
        value={event.context.error_message}
      />
      <ExpandableEventField
        label={translate('Organization')}
        value={event.context.customer_name}
        state="organization.details"
        params={{ uuid: event.context.customer_uuid }}
      />
      <ExpandableEventField
        label={translate('Project')}
        value={event.context.project_name}
        state="project.details"
        params={{ uuid: event.context.project_uuid }}
      />
      <ExpandableEventField
        label={translate('Provider')}
        value={event.context.service_name}
      />
      <ExpandableEventField
        label={translate('Resource')}
        value={event.context.resource_full_name}
        state="resource-details"
        params={{
          uuid: event.context.project_uuid,
          resource_uuid: event.context.resource_uuid,
          resource_type: event.context.resource_type,
        }}
      />
      <ExpandableEventField
        label={translate('Resource configuration')}
        value={event.context.resource_configuration}
      />
      <ExpandableEventField
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
    </dl>
  );
