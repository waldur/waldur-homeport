import { translate } from '@waldur/i18n';
import { Field, ResourceSummaryProps } from '@waldur/resource/summary';

import { AzureResource } from './types';

export function PureAzureResourceSummary<R extends AzureResource = any>(
  props: ResourceSummaryProps<R>,
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
