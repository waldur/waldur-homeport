import { FieldWithCopy } from '@/core/FieldWithCopy';
import { Link } from '@/core/Link';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { ResourceState } from '@/resource/state/ResourceState';
import { Resource } from '@/resource/types';

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
  const Component = props.formTableItem ? FormTable.Item : Field;
  return (
    <>
      {!props.hideBaseInfo && (
        <Component
          label={translate('Name')}
          value={<FieldWithCopy value={resource.name} />}
        />
      )}
      {(resource as any).parent_uuid && (resource as any).parent_name ? (
        <Component
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
        <Component
          label={translate('State')}
          value={<ResourceState {...props} />}
        />
      )}
      <ErrorMessageField {...props} />
      {!props.resource.marketplace_offering_uuid && (
        <Component
          label={translate('Provider')}
          value={resource.service_name}
        />
      )}
      <Component
        label={translate('Description')}
        value={resource.description}
      />
      <Component
        label={translate('Created')}
        value={<CreatedField resource={props.resource} />}
      />

      <Component
        label={translate('Termination date')}
        value={resource.end_date}
      />
      <Component
        label={translate('Metadata')}
        value={ResourceMetadataLink(props)}
        valueClass="text-decoration-underline"
      />
    </>
  );
}
