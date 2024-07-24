import { FunctionComponent, PropsWithChildren } from 'react';
import { Container } from 'react-bootstrap';

import { ENV } from '@waldur/configs/default';
import { formatDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';
import { CreatedField } from '@waldur/resource/summary/CreatedField';
import { formatResourceType } from '@waldur/resource/utils';

import { KeyValueButton } from '../KeyValueButton';
import { Resource } from '../types';

import { PlanDetailsField } from './PlanDetailsField';

interface ResourceSummaryProps {
  resource: Resource;
  scope: { error_message?; error_traceback? };
}

export const ResourceSummary: FunctionComponent<
  PropsWithChildren<ResourceSummaryProps>
> = ({ resource, scope, children }) => (
  <Container className="container-metadata">
    <Field
      label={translate('Resource type')}
      value={formatResourceType(resource)}
    />
    <Field label={translate('Offering name')} value={resource.offering_name} />
    <Field
      label={translate('Client organization')}
      value={resource.customer_name}
    />
    <Field label={translate('Client project')} value={resource.project_name} />
    <Field label={translate('Category')} value={resource.category_title} />
    <PlanDetailsField resource={resource} />
    <Field
      label={translate('Created')}
      value={<CreatedField resource={resource} />}
    />
    {ENV.plugins.WALDUR_MARKETPLACE.ENABLE_RESOURCE_END_DATE ? (
      <Field
        label={translate('Termination date')}
        value={resource.end_date ? formatDate(resource.end_date) : null}
      />
    ) : null}
    <Field
      label={translate('UUID')}
      value={resource.uuid}
      valueClass="ellipsis"
    />
    <Field label={translate('Slug')} value={resource.slug} />
    <Field label={translate('Backend ID')} value={resource.backend_id} />
    <Field label={translate('Effective ID')} value={resource.effective_id} />
    <Field label={translate('Plugin ID')} value={resource.resource_uuid} />
    <Field
      label={translate('Sync state')}
      value={resource.state}
      helpText={translate('Shows state of synchronisation with accounting.')}
    />
    <Field
      label={translate('Backend sync')}
      value={resource.backend_metadata?.state}
      helpText={translate(
        'Shows state of synchronisation with backend system.',
      )}
    />
    <Field
      label={translate('Runtime state')}
      value={resource.backend_metadata?.runtime_state}
      helpText={translate(
        'Shows state of a resource as reported by backend system.',
      )}
    />
    <Field
      label={translate('Current action')}
      value={resource.backend_metadata?.action}
    />
    <Field label={translate('Error message')}>
      {resource.error_message || scope?.error_message}
    </Field>
    <Field label={translate('Error traceback')}>
      {resource.error_traceback || scope?.error_traceback}
    </Field>

    {resource.attributes ? (
      <Field
        label={translate('Attributes')}
        value={
          Object.keys(resource.attributes).length > 0 && (
            <KeyValueButton
              items={resource.attributes}
              title={translate('Attributes')}
            />
          )
        }
      />
    ) : null}

    {resource.backend_metadata ? (
      <Field
        label={translate('Backend metadata')}
        value={
          Object.keys(resource.backend_metadata).length > 0 && (
            <KeyValueButton
              items={resource.backend_metadata}
              title={translate('Backend metadata')}
            />
          )
        }
      />
    ) : null}

    <Field label={translate('Username')} value={resource.username} />
    {children}
  </Container>
);
