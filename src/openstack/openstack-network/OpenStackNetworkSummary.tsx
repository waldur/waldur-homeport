import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { Field, ResourceSummaryProps } from '@/resource/summary';
import { formatDefault } from '@/resource/utils';
import { renderFieldOrDash } from '@/table/utils';

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
        value={renderFieldOrDash(resource.backend_id)}
        hasCopy={!!resource.backend_id}
      />
    </>
  );
};
