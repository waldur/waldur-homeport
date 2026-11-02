import type { VmwarePort } from 'waldur-js-client';

import { PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { ResourceSummaryProps } from '@/resource/summary';

export const VMwarePortSummary = (props: ResourceSummaryProps<VmwarePort>) => {
  const { resource } = props;
  return (
    <>
      <PropertyItem
        label={translate('MAC address')}
        value={resource.mac_address}
      />
      <PropertyItem
        label={translate('Network')}
        value={resource.network_name}
      />
    </>
  );
};
