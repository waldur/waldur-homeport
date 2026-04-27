import { AzureSqlDatabase } from 'waldur-js-client';

import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { ResourceLink } from '@/resource/ResourceLink';
import { Field, ResourceSummaryProps } from '@/resource/summary';

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
