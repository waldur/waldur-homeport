import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { ResourceLink } from '@/resource/ResourceLink';
import { Field, ResourceSummaryProps } from '@/resource/summary';

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
