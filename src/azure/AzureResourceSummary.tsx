import {
  AzureSqlDatabase,
  AzureSqlServer,
  AzureVirtualMachine,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { Field, ResourceSummaryProps } from '@waldur/resource/summary';

export function PureAzureResourceSummary(
  props: ResourceSummaryProps<
    AzureVirtualMachine | AzureSqlDatabase | AzureSqlServer
  >,
) {
  const { resource } = props;
  return (
    <>
      <Field
        label={translate('Resource group')}
        value={resource.resource_group_name}
      />

      <Field label={translate('Location')} value={resource.location_name} />
    </>
  );
}
