import { AzureVirtualMachine } from 'waldur-js-client';

import FormTable from '@waldur/form/FormTable';
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
  const Component = props.formTableItem ? FormTable.Item : Field;
  return (
    <>
      <PureAzureResourceSummary {...props} />
      <Component label={translate('Summary')} value={formatSummary(resource)} />
      <Component
        label={translate('Admin username')}
        value={resource.username}
      />
      <Component
        label={translate('Admin password')}
        value={<UserPassword password={resource.password} />}
      />

      <Component label={translate('Size')} value={resource.size_name} />
      <Component
        label={translate('Internal IP')}
        value={<IPList value={props.resource.internal_ips} />}
      />

      <Component
        label={translate('External IP')}
        value={<IPList value={props.resource.external_ips} />}
      />
    </>
  );
};
