import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { ResourceLink } from '@waldur/resource/ResourceLink';
import { Field, ResourceSummaryProps } from '@waldur/resource/summary';

export const OpenStackSnapshotSummary = ({
  resource,
}: ResourceSummaryProps) => (
  <>
    <Field label={translate('Size')} value={formatFilesize(resource.size)} />
    <Field
      label={translate('Volume')}
      value={
        <ResourceLink
          uuid={resource.source_volume_marketplace_uuid}
          label={resource.source_volume_name}
        />
      }
    />
  </>
);
