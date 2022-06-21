import { AzureSQLDatabase } from '@waldur/azure/common/types';
import { translate } from '@waldur/i18n';
import { ResourceLink } from '@waldur/resource/ResourceLink';
import { Field, ResourceSummaryProps } from '@waldur/resource/summary';

import { PureAzureResourceSummary } from '../AzureResourceSummary';

export const AzureSQLDatabaseSummary = (
  props: ResourceSummaryProps<AzureSQLDatabase>,
) => {
  const { resource } = props;
  return (
    <>
      <PureAzureResourceSummary {...props} />
      <Field label={translate('Server')}>
        <ResourceLink
          type="Azure.SQLServer"
          uuid={resource.server_uuid}
          project={resource.project_uuid}
          label={resource.server_name}
        />
      </Field>
      <Field label={translate('Charset')}>{resource.charset}</Field>
      <Field label={translate('Collation')}>{resource.collation}</Field>
    </>
  );
};
