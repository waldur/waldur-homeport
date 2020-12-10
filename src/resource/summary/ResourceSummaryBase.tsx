import { withTranslation } from '@waldur/i18n';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { Resource } from '@waldur/resource/types';

import { CreatedField } from './CreatedField';
import { ErrorMessageField } from './ErrorMessageField';
import { Field } from './Field';
import { ResourceSummaryProps } from './types';

export function PureResourceSummaryBase<T extends Resource = any>(
  props: ResourceSummaryProps<T>,
) {
  const { translate, resource } = props;
  return (
    <>
      <Field label={translate('State')} value={<ResourceState {...props} />} />
      <ErrorMessageField {...props} />
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
        helpText={translate('Unique ID of a resource within management plugin')}
      />
      {resource.marketplace_resource_uuid && (
        <Field
          label={translate('Marketplace UUID')}
          value={resource.marketplace_resource_uuid}
          valueClass="ellipsis"
          helpText={translate(
            'Unique ID of a resource created via Marketplace',
          )}
        />
      )}
      {!props.hideBackendId && (
        <Field
          label={translate('Backend ID')}
          value={resource.backend_id}
          valueClass="ellipsis"
          helpText={translate('Unique ID of a resource in a backend system')}
        />
      )}
    </>
  );
}

export const ResourceSummaryBase = withTranslation(PureResourceSummaryBase);
