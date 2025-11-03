import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { Field, ResourceSummaryProps } from '@waldur/resource/summary';
import { formatDefault } from '@waldur/resource/utils';

import { Network } from './types';

export const OpenStackNetworkSummary = (
  props: ResourceSummaryProps<Network>,
) => {
  const { resource } = props;
  const Component = props.formTableItem ? FormTable.Item : Field;
  return (
    <>
      <Component
        label={translate('Type')}
        value={formatDefault(resource.type)}
        valueClass="ellipsis"
      />

      <Component
        label={translate('Segmentation ID')}
        value={formatDefault(resource.segmentation_id)}
      />

      <Component
        label={translate('Is external')}
        value={resource.is_external ? translate('Yes') : translate('No')}
      />

      <Component label={translate('MTU')} value={formatDefault(resource.mtu)} />
      <Component
        label={translate('Backend ID')}
        value={resource.backend_id || 'N/A'}
        hasCopy={!!resource.backend_id}
      />
    </>
  );
};
