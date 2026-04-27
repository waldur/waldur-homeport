import { VmwareVirtualMachine } from 'waldur-js-client';

import { ENV } from '@/core/config';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { Field, ResourceSummaryProps } from '@/resource/summary';
import { formatSummary } from '@/resource/utils';

export const VMwareVirtualMachineSummary = (
  props: ResourceSummaryProps<VmwareVirtualMachine>,
) => {
  const { resource } = props;
  const advancedMode = !ENV.plugins.WALDUR_VMWARE.BASIC_MODE;
  const Component = props.formTableItem ? FormTable.Item : Field;
  return (
    <>
      <Component label={translate('Summary')} value={formatSummary(resource)} />
      <Component label={translate('Guest OS')} value={resource.guest_os_name} />
      <Component
        label={translate('VMware Tools')}
        value={resource.tools_state}
      />
      {advancedMode && (
        <>
          <Component
            label={translate('Template')}
            value={resource.template_name}
          />
          <Component
            label={translate('Cluster')}
            value={resource.cluster_name}
          />
          <Component
            label={translate('Datastore')}
            value={resource.datastore_name}
          />
        </>
      )}
    </>
  );
};
