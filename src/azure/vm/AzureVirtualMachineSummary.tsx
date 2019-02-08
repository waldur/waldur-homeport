import * as React from 'react';

import { AzureVirtualMachine } from '@waldur/azure/common/types';
import { withTranslation } from '@waldur/i18n';
import { Field, ResourceSummaryProps } from '@waldur/resource/summary';
import { UserPassword } from '@waldur/resource/UserPassword';
import { formatSummary } from '@waldur/resource/utils';

import { PureAzureResourceSummary } from '../AzureResourceSummary';

const PureAzureVirtualMachineSummary = (props: ResourceSummaryProps<AzureVirtualMachine>) => {
  const { translate, resource } = props;
  return (
    <>
      <PureAzureResourceSummary {...props}/>
      <Field
        label={translate('Summary')}
        value={formatSummary(resource)}
      />
      <Field
        label={translate('Admin username')}
        value={resource.username}
      />
      <Field
        label={translate('Admin password')}
        value={<UserPassword password={resource.password}/>}
      />
      <Field
        label={translate('Size')}
        value={resource.size_name}
      />
    </>
  );
};

export const AzureVirtualMachineSummary = withTranslation(PureAzureVirtualMachineSummary);
