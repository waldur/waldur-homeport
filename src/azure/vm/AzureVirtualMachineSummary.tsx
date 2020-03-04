import * as React from 'react';

import { AzureVirtualMachine } from '@waldur/azure/common/types';
import { withTranslation } from '@waldur/i18n';
import { Field, ResourceSummaryProps } from '@waldur/resource/summary';
import { formatIpList } from '@waldur/resource/summary/VirtualMachineSummary';
import { UserPassword } from '@waldur/resource/UserPassword';
import { formatSummary } from '@waldur/resource/utils';

import { PureAzureResourceSummary } from '../AzureResourceSummary';

const PureAzureVirtualMachineSummary = (
  props: ResourceSummaryProps<AzureVirtualMachine>,
) => {
  const { translate, resource } = props;
  return (
    <>
      <PureAzureResourceSummary {...props} />
      <Field label={translate('Summary')} value={formatSummary(resource)} />
      <Field label={translate('Admin username')} value={resource.username} />
      <Field
        label={translate('Admin password')}
        value={<UserPassword password={resource.password} />}
      />
      <Field label={translate('Size')} value={resource.size_name} />
      <Field
        label={translate('Internal IP')}
        value={formatIpList(props.resource.internal_ips)}
      />
      <Field
        label={translate('External IP')}
        value={formatIpList(props.resource.external_ips)}
      />
    </>
  );
};

export const AzureVirtualMachineSummary = withTranslation(
  PureAzureVirtualMachineSummary,
);
