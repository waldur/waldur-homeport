import type { OpenStackFloatingIp } from 'waldur-js-client';

import { PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { ResourceSummaryProps } from '@/resource/summary';

export const OpenStackFloatingIpSummary = (
  props: ResourceSummaryProps<OpenStackFloatingIp>,
) => {
  const { resource } = props;
  return (
    <>
      <PropertyItem
        label={translate('Runtime state')}
        value={resource.runtime_state}
      />
      <PropertyItem
        label={translate('Backend ID')}
        value={resource.backend_id}
        hasCopy
      />
      <PropertyItem
        label={translate('Public IP')}
        value={resource.external_address}
        hasCopy
        hideIfEmpty
      />
    </>
  );
};
