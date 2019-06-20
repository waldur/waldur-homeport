import * as React from 'react';

import { withTranslation } from '@waldur/i18n';
import { Field, PureResourceSummaryBase } from '@waldur/resource/summary';
import { formatSummary } from '@waldur/resource/utils';

const PureVMwareVirtualMachineSummary = props => {
  const { translate, resource } = props;
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
    </>
  );
};

export const VMwareVirtualMachineSummary = withTranslation(PureVMwareVirtualMachineSummary);
