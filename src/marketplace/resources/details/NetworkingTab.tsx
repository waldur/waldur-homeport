import { useAsync } from 'react-use';

import { get } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { OpenStackInstanceTenantButton } from '@waldur/openstack/openstack-instance/OpenStackInstanceTenantButton';
import { OpenStackSecurityGroupsLink } from '@waldur/openstack/openstack-security-groups/OpenStackSecurityGroupsLink';
import { Field } from '@waldur/resource/summary';
import { formatIpList } from '@waldur/resource/summary/VirtualMachineSummary';

export const NetworkingTab = ({ resource }) => {
  const { loading, error, value } = useAsync(() =>
    get<any>(resource.scope).then((response) => response.data),
  );

  if (loading) return <LoadingSpinner />;

  if (error) return <>{translate('Unable to load resource details.')}</>;

  return (
    <>
      <Field
        label={translate('Internal IP')}
        value={formatIpList(value.internal_ips)}
      />
      <Field
        label={translate('External IP')}
        value={formatIpList(value.external_ips)}
      />
      <Field
        label={translate('SSH key')}
        value={value.key_name}
        helpText={value.key_fingerprint}
      />

      {value.security_groups && (
        <Field
          label={translate('Security groups')}
          value={<OpenStackSecurityGroupsLink items={value.security_groups} />}
        />
      )}

      <div className="mt-3">
        <OpenStackInstanceTenantButton resource={value} />
      </div>
    </>
  );
};
