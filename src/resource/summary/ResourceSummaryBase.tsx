import { ENV } from '@waldur/configs/default';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { Resource } from '@waldur/resource/types';

import { CreatedField } from './CreatedField';
import { ErrorMessageField } from './ErrorMessageField';
import { Field } from './Field';
import { ResourceMetadataLink } from './ResourceMetadataLink';
import { ResourceSummaryProps } from './types';

interface ExtraProps {
  hideBaseInfo?: boolean;
}

export function ResourceSummaryBase<T extends Resource = Resource>(
  props: ResourceSummaryProps<T> & ExtraProps,
) {
  const { resource } = props;
  return (
    <>
      {!props.hideBaseInfo && (
        <Field label={translate('Name')} value={resource.name} hasCopy />
      )}
      {(resource as any).parent_uuid && (resource as any).parent_name ? (
        <Field
          label={translate('Part of')}
          value={
            <Link
              state="marketplace-resource-details"
              params={{
                resource_uuid: (resource as any).parent_uuid,
              }}
              label={(resource as any).parent_name}
            />
          }
        />
      ) : null}
      {!props.hideBaseInfo && (
        <Field
          label={translate('State')}
          value={<ResourceState {...props} />}
        />
      )}
      <ErrorMessageField {...props} />
      {!props.resource.marketplace_offering_uuid && (
        <Field label={translate('Provider')} value={resource.service_name} />
      )}
      <Field label={translate('Description')} value={resource.description} />
      <Field
        label={translate('Created')}
        value={<CreatedField resource={props.resource} />}
      />
      {ENV.plugins.WALDUR_MARKETPLACE.ENABLE_RESOURCE_END_DATE ? (
        <Field
          label={translate('Termination date')}
          value={resource.end_date}
        />
      ) : null}
      <Field
        label={translate('Metadata')}
        value={ResourceMetadataLink(props)}
        valueClass="text-decoration-underline"
      />
    </>
  );
}
