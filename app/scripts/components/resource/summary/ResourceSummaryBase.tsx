import * as React from 'react';

import { formatDateTime, formatFromNow } from '@waldur/core/dateUtils';
import { withTranslation } from '@waldur/i18n';
import { ResourceState } from '@waldur/resource/state/ResourceState';

import { Field } from './Field';
import { ResourceSummaryProps } from './types';

const formatErrorField = (props: ResourceSummaryProps) => {
  if (props.resource.state !== 'Erred') {
    return null;
  }
  if (!props.resource.error_message) {
    return props.translate('Reason unknown, please contact support.');
  }
  return props.resource.error_message;
};

const formatCreatedField = (props: ResourceSummaryProps) => (
  props.resource.created ? (
    <span>
      {formatFromNow(props.resource.created)}
      {', '}
      {formatDateTime(props.resource.created)}
    </span>
  ) : null
);

export const PureResourceSummaryBase = (props: ResourceSummaryProps) => {
  const { translate, resource } = props;
  return (
    <>
      <Field
        label={translate('State')}
        value={<ResourceState {...props}/>}
      />
      <Field
        label={translate('Error message')}
        value={formatErrorField(props)}
      />
      <Field
        label={translate('Provider')}
        value={resource.service_name}
      />
      <Field
        label={translate('Description')}
        value={resource.description}
      />
      <Field
        label={translate('Created')}
        value={formatCreatedField(props)}
      />
      <Field
        label={translate('UUID')}
        value={resource.uuid}
        valueClass="elipsis"
      />
      <Field
        label={translate('Backend ID')}
        value={resource.backend_id}
        valueClass="elipsis"
      />
    </>
  );
};

export const ResourceSummaryBase = withTranslation(PureResourceSummaryBase);
