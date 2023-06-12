import { translate } from '@waldur/i18n';
import { Field, ResourceSummaryProps } from '@waldur/resource/summary';
import { formatDefault } from '@waldur/resource/utils';

import { Network } from './types';

export const OpenStackNetworkSummary = (
  props: ResourceSummaryProps<Network>,
) => {
  const { resource } = props;
  return (
    <>
      <Field
        label={translate('Type')}
        value={formatDefault(resource.type)}
        valueClass="ellipsis"
      />
      <Field
        label={translate('Segmentation ID')}
        value={formatDefault(resource.segmentation_id)}
      />
      <Field
        label={translate('Is external')}
        value={resource.is_external ? translate('Yes') : translate('No')}
      />
      <Field label={translate('MTU')} value={formatDefault(resource.mtu)} />
    </>
  );
};
