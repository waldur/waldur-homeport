import { PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import { ResourceState } from '@/resource/state/ResourceState';
import { Resource } from '@/resource/types';

import { CreatedField } from './CreatedField';
import { ErrorMessageField } from './ErrorMessageField';
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
        <PropertyItem label={translate('Name')} value={resource.name} hasCopy />
      )}
      {(resource as any).parent_uuid && (resource as any).parent_name ? (
        <PropertyItem
          label={translate('Part of')}
          value={propVal.link((resource as any).parent_name, {
            state: 'marketplace-resource-details',
            params: {
              resource_uuid: (resource as any).parent_uuid,
            },
          })}
        />
      ) : null}
      {!props.hideBaseInfo && (
        <PropertyItem
          label={translate('State')}
          value={<ResourceState {...props} />}
        />
      )}
      <ErrorMessageField {...props} />
      {!props.resource.marketplace_offering_uuid && (
        <PropertyItem
          label={translate('Provider')}
          value={resource.service_name}
        />
      )}
      <PropertyItem
        label={translate('Description')}
        value={resource.description}
      />
      <PropertyItem
        label={translate('Created')}
        value={<CreatedField resource={props.resource} />}
      />

      <PropertyItem
        label={translate('Termination date')}
        value={resource.end_date}
      />
      <PropertyItem
        label={translate('Metadata')}
        value={ResourceMetadataLink(props)}
        valueClass="underline"
      />
    </>
  );
}
