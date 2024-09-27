import { translate } from '@waldur/i18n';
import { ResourceLink } from '@waldur/resource/ResourceLink';
import { Field, ResourceSummaryProps } from '@waldur/resource/summary';

export const OpenStackBackupSummary = ({ resource }: ResourceSummaryProps) => (
  <Field
    label={translate('Instance')}
    value={
      <ResourceLink
        uuid={resource.instance_marketplace_uuid}
        label={resource.instance_name}
      />
    }
  />
);
