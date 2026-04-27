import {
  AzureSqlDatabase,
  AzureSqlServer,
  AzureVirtualMachine,
} from 'waldur-js-client';

import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { Field, ResourceSummaryProps } from '@/resource/summary';

export function PureAzureResourceSummary(
  props: ResourceSummaryProps<
    AzureVirtualMachine | AzureSqlDatabase | AzureSqlServer
  >,
) {
  const { resource } = props;
  const Component = props.formTableItem ? FormTable.Item : Field;
  return (
    <>
      <Component
        label={translate('Resource group')}
        value={resource.resource_group_name}
      />

      <Component label={translate('Location')} value={resource.location_name} />
    </>
  );
}
