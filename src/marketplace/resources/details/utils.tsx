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
    },
    {
      name: 'resource_type',
      label: translate('Resource type'),
      value: formatResourceType(resource),
    },
    {
      name: 'offering_name',
      label: translate('Offering name'),
      value: resource.offering_name,
    },
    {
      name: 'customer_name',
      label: translate('Client organization'),
      value: resource.customer_name,
    },
    {
      name: 'project_name',
      label: translate('Client project'),
      value: resource.project_name,
    },
    {
      name: 'category_title',
      label: translate('Category'),
      value: resource.category_title,
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
      value: <ResourceStateField resource={resource} outline pill size="sm" />,
    },
    {
      name: 'created',
      label: translate('Created'),
      value: <CreatedField resource={resource} />,
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
    },
    {
      name: 'slug',
      label: translate('Slug'),
      value: resource.slug,
    },
    {
      name: 'backend_id',
      label: translate('Backend ID'),
      value: resource.backend_id,
    },
    {
      name: 'effective_id',
      label: translate('Effective ID'),
      value: resource.effective_id,
    },
    {
      name: 'resource_uuid',
      label: translate('Plugin ID'),
      value: resource.resource_uuid,
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
      helpText: translate('Shows state of synchronisation with accounting.'),
    },
    {
      name: 'backend_metadata.state',
      label: translate('Backend sync'),
      value: resource.backend_metadata?.state,
      helpText: translate(
        'Shows state of synchronisation with backend system.',
      ),
    },
    {
      name: 'backend_metadata.runtime_state',
      label: translate('Runtime state'),
      value: resource.backend_metadata?.runtime_state,
      helpText: translate(
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
    },
    {
      name: 'error_traceback',
      label: translate('Error traceback'),
      value: resource.error_traceback || scope?.error_traceback,
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
    },
  ].filter(
    (field) =>
      field &&
      (!include || include.includes(field.name)) &&
      (!exclude || !exclude.includes(field.name)),
  );
};
