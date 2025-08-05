import { AzureSqlDatabase } from 'waldur-js-client';

import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { ResourceLink } from '@waldur/resource/ResourceLink';
import { Field, ResourceSummaryProps } from '@waldur/resource/summary';

import { PureAzureResourceSummary } from '../AzureResourceSummary';

export const AzureSQLDatabaseSummary = (
  props: ResourceSummaryProps<AzureSqlDatabase>,
) => {
  const { resource } = props;
  const Component = props.formTableItem ? FormTable.Item : Field;
  return (
    <>
      <PureAzureResourceSummary {...props} />
      <Component label={translate('Server')}>
        <ResourceLink
          uuid={resource.server_marketplace_uuid}
          label={resource.server_name}
        />
      </Component>
      <Component label={translate('Charset')}>{resource.charset}</Component>
      <Component label={translate('Collation')}>{resource.collation}</Component>
    </>
  );
};
