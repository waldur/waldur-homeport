import * as React from 'react';

import { ENV } from '@waldur/core/services';
import { withTranslation } from '@waldur/i18n';
import { Field, PureResourceSummaryBase } from '@waldur/resource/summary';
import { formatSummary } from '@waldur/resource/utils';

const PureVMwareVirtualMachineSummary = props => {
  const { translate, resource } = props;
  const advancedMode = !ENV.plugins.WALDUR_VMWARE.BASIC_MODE;
  return (
    <>
      <PureResourceSummaryBase {...props}/>
      <Field
        label={translate('Summary')}
        value={formatSummary(resource)}
      />
      <Field
        label={translate('Guest OS')}
        value={resource.guest_os_name}
      />
      <Field
        label={translate('Guest OS power state')}
        value={resource.guest_power_state}
      />
      {advancedMode && (
        <>
          <Field
            label={translate('Template')}
            value={resource.template_name}
          />
          <Field
            label={translate('Cluster')}
            value={resource.cluster_name}
          />
          <Field
            label={translate('Datastore')}
            value={resource.datastore_name}
          />
        </>
      )}
    </>
  );
};

export const VMwareVirtualMachineSummary = withTranslation(PureVMwareVirtualMachineSummary);
