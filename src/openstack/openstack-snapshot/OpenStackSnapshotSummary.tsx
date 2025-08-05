import { formatFilesize } from '@waldur/core/utils';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { ResourceLink } from '@waldur/resource/ResourceLink';
import { Field, ResourceSummaryProps } from '@waldur/resource/summary';

export const OpenStackSnapshotSummary = ({
  resource,
  formTableItem,
}: ResourceSummaryProps) => {
  const Component = formTableItem ? FormTable.Item : Field;
  return (
    <>
      <Component
        label={translate('Size')}
        value={formatFilesize(resource.size)}
      />
      <Component
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
};
