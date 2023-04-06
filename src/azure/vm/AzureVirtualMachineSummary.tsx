import { AzureVirtualMachine } from '@waldur/azure/common/types';
import { translate } from '@waldur/i18n';
import { IPList } from '@waldur/resource/IPList';
import { Field, ResourceSummaryProps } from '@waldur/resource/summary';
import { UserPassword } from '@waldur/resource/UserPassword';
import { formatSummary } from '@waldur/resource/utils';

import { PureAzureResourceSummary } from '../AzureResourceSummary';

export const AzureVirtualMachineSummary = (
  props: ResourceSummaryProps<AzureVirtualMachine>,
) => {
  const { resource } = props;
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
        value={<IPList value={props.resource.internal_ips} />}
      />
      <Field
        label={translate('External IP')}
        value={<IPList value={props.resource.external_ips} />}
      />
    </>
  );
};
