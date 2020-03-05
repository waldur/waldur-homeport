import * as React from 'react';

import { withTranslation } from '@waldur/i18n';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { Resource } from '@waldur/resource/types';

import { CreatedField } from './CreatedField';
import { Field } from './Field';
import { ResourceSummaryProps } from './types';

const formatErrorField = (props: ResourceSummaryProps) => {
  if (
    props.resource.state !== 'Erred' &&
    props.resource.runtime_state !== 'ERROR'
  ) {
    return null;
  }
  if (!props.resource.error_message) {
    return props.translate('Reason unknown, please contact support.');
  }
  return props.resource.error_message;
};

export function PureResourceSummaryBase<T extends Resource = any>(
  props: ResourceSummaryProps<T>,
) {
  const { translate, resource } = props;
  return (
    <>
      <Field label={translate('State')} value={<ResourceState {...props} />} />
      <Field
        label={translate('Error message')}
        value={formatErrorField(props)}
      />
      {!props.resource.marketplace_offering_uuid && (
        <Field label={translate('Provider')} value={resource.service_name} />
      )}
      <Field label={translate('Description')} value={resource.description} />
      <Field
        label={translate('Created')}
        value={<CreatedField resource={props.resource} />}
      />
      <Field
        label={translate('UUID')}
        value={resource.uuid}
        valueClass="ellipsis"
      />
      {!props.hideBackendId && (
        <Field
          label={translate('Backend ID')}
          value={resource.backend_id}
          valueClass="ellipsis"
        />
      )}
    </>
  );
}

export const ResourceSummaryBase = withTranslation(PureResourceSummaryBase);
