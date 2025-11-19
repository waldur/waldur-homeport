import { Resource } from 'waldur-js-client';

import { formatDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { CreatedField } from '@waldur/resource/summary/CreatedField';
import { formatResourceType } from '@waldur/resource/utils';

import { KeyValueButton } from '../KeyValueButton';
import { ResourceStateField } from '../list/ResourceStateField';

import { PlanDetailsField } from './PlanDetailsField';

export const getResourceSummaryFields = ({
  resource,
  scope,
  include,
  exclude,
}: {
  resource: Resource;
  scope?;
  include?: string[];
  exclude?: string[];
}) => {
  return [
    {
      name: 'name',
      label: translate('Name'),
      value: resource.name,
      hasCopy: true,
    },
    {
      name: 'resource_type',
      label: translate('Resource type'),
      value: formatResourceType(resource),
      hasCopy: true,
    },
    {
      name: 'offering_name',
      label: translate('Offering name'),
      value: resource.offering_name,
      hasCopy: true,
    },
    {
      name: 'customer_name',
      label: translate('Client organization'),
      value: resource.customer_name,
      hasCopy: true,
    },
    {
      name: 'project_name',
      label: translate('Client project'),
      value: resource.project_name,
      hasCopy: true,
    },
    {
      name: 'category_title',
      label: translate('Category'),
      value: resource.category_title,
      hasCopy: true,
    },
    {
      name: 'plan_name',
      label: null,
      value: null,
      custom: <PlanDetailsField resource={resource} />,
    },
    {
      name: 'status',
      label: translate('Status'),
      value: <ResourceStateField resource={resource} pill outline size="sm" />,
    },
    {
      name: 'created',
      label: translate('Created'),
      value: <CreatedField resource={resource} />,
    },
    {
      name: 'start_date',
      label: translate('Start date'),
      value: resource.creation_order?.start_date
        ? formatDate(resource.creation_order.start_date)
        : null,
    },
    {
      name: 'end_date',
      label: translate('Termination date'),
      value: resource.end_date ? formatDate(resource.end_date) : null,
    },
    {
      name: 'uuid',
      label: translate('UUID'),
      value: resource.uuid,
      valueClass: 'ellipsis',
      hasCopy: true,
    },
    {
      name: 'slug',
      label: translate('Slug'),
      value: resource.slug,
      hasCopy: true,
    },
    {
      name: 'backend_id',
      label: translate('Backend ID'),
      value: resource.backend_id,
      hasCopy: true,
    },
    {
      name: 'effective_id',
      label: translate('Effective ID'),
      value: resource.effective_id,
      hasCopy: true,
    },
    {
      name: 'resource_uuid',
      label: translate('Plugin ID'),
      value: resource.resource_uuid,
      hasCopy: true,
    },
    {
      name: 'paused',
      label: translate('Paused'),
      value: resource.paused,
    },
    {
      name: 'downscaled',
      label: translate('Downscaled'),
      value: resource.downscaled,
    },
    {
      name: 'restrict_member_access',
      label: translate('Restrict member access'),
      value: resource.restrict_member_access,
    },
    {
      name: 'state',
      label: translate('Sync state'),
      value: resource.state,
      tooltip: translate('Shows state of synchronisation with accounting.'),
    },
    {
      name: 'backend_metadata.state',
      label: translate('Backend sync'),
      value: resource.backend_metadata?.state,
      tooltip: translate('Shows state of synchronisation with backend system.'),
    },
    {
      name: 'backend_metadata.runtime_state',
      label: translate('Runtime state'),
      value: resource.backend_metadata?.runtime_state,
      tooltip: translate(
        'Shows state of a resource as reported by backend system.',
      ),
    },
    {
      name: 'backend_metadata.action',
      label: translate('Current action'),
      value: resource.backend_metadata?.action,
    },
    {
      name: 'error_message',
      label: translate('Error message'),
      value: resource.error_message || scope?.error_message,
      hasCopy: true,
    },
    {
      name: 'error_traceback',
      label: translate('Error traceback'),
      value: resource.error_traceback || scope?.error_traceback,
      hasCopy: true,
    },
    resource.attributes
      ? {
          name: 'attributes',
          label: translate('Attributes'),
          value: Object.keys(resource.attributes).length > 0 && (
            <KeyValueButton
              items={resource.attributes}
              title={translate('Attributes')}
            />
          ),
        }
      : null,
    resource.backend_metadata
      ? {
          name: 'backend_metadata',
          label: translate('Backend metadata'),
          value: Object.keys(resource.backend_metadata).length > 0 && (
            <KeyValueButton
              items={resource.backend_metadata}
              title={translate('Backend metadata')}
            />
          ),
        }
      : null,
    {
      name: 'username',
      label: translate('Username'),
      value: resource.username,
      hasCopy: true,
    },
  ].filter(
    (field) =>
      field &&
      (!include || include.includes(field.name)) &&
      (!exclude || !exclude.includes(field.name)),
  );
};
