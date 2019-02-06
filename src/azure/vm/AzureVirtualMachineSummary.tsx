import * as React from 'react';

import { withTranslation } from '@waldur/i18n';
import { Field, ResourceSummaryProps, PureVirtualMachineSummary } from '@waldur/resource/summary';
import { UserPassword } from '@waldur/resource/UserPassword';

const PureAzureVirtualMachineSummary = (props: ResourceSummaryProps) => {
  const { translate, resource } = props;
  return (
    <span>
      <PureVirtualMachineSummary {...props}/>
      <Field
        label={translate('Username')}
        value={resource.username}
      />
      <Field
        label={translate('Password')}
        value={<UserPassword {...props}/>}
      />
    </span>
  );
};

export const AzureVirtualMachineSummary = withTranslation(PureAzureVirtualMachineSummary);
