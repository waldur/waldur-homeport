import { VmwareVirtualMachine } from 'waldur-js-client';

import { PropertyItem } from 'waldur-ui';

import { ENV } from '@/core/config';
import { translate } from '@/i18n';
import { ResourceSummaryProps } from '@/resource/summary';
import { formatSummary } from '@/resource/utils';

export const VMwareVirtualMachineSummary = (
  props: ResourceSummaryProps<VmwareVirtualMachine>,
) => {
  const { resource } = props;
  const advancedMode = !ENV.plugins.WALDUR_VMWARE.BASIC_MODE;
  return (
    <>
      <PropertyItem
        label={translate('Summary')}
        value={formatSummary(resource)}
      />
      <PropertyItem
        label={translate('Guest OS')}
        value={resource.guest_os_name}
      />
      <PropertyItem
        label={translate('VMware Tools')}
        value={resource.tools_state}
      />
      {advancedMode && (
        <>
          <PropertyItem
            label={translate('Template')}
            value={resource.template_name}
          />
          <PropertyItem
            label={translate('Cluster')}
            value={resource.cluster_name}
          />
          <PropertyItem
            label={translate('Datastore')}
            value={resource.datastore_name}
          />
        </>
      )}
    </>
  );
};
