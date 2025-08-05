import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { ResourceLink } from '@waldur/resource/ResourceLink';
import { Field, ResourceSummaryProps } from '@waldur/resource/summary';

export const OpenStackBackupSummary = ({
  resource,
  formTableItem,
}: ResourceSummaryProps) => {
  const Component = formTableItem ? FormTable.Item : Field;
  return (
    <Component
      label={translate('Instance')}
      value={
        <ResourceLink
          uuid={resource.instance_marketplace_uuid}
          label={resource.instance_name}
        />
      }
    />
  );
};
