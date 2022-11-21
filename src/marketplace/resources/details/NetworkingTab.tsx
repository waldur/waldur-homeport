import { translate } from '@waldur/i18n';
import { InstanceNetworkButton } from '@waldur/openstack/openstack-instance/InstanceNetworkButton';
import { OpenStackSecurityGroupsLink } from '@waldur/openstack/openstack-security-groups/OpenStackSecurityGroupsLink';
import { Field } from '@waldur/resource/summary';
import { formatIpList } from '@waldur/resource/summary/VirtualMachineSummary';

export const NetworkingTab = ({ resource, scope, state }) => (
  <>
    <Field
      label={translate('Internal IP')}
      value={formatIpList(scope.internal_ips)}
    />
    <Field
      label={translate('External IP')}
      value={formatIpList(scope.external_ips)}
    />
    <Field
      label={translate('SSH key')}
      value={scope.key_name}
      helpText={scope.key_fingerprint}
    />

    {scope.security_groups && (
      <Field
        label={translate('Security groups')}
        value={<OpenStackSecurityGroupsLink items={scope.security_groups} />}
      />
    )}

    <div className="mt-3">
      {resource.parent_uuid ? (
        <InstanceNetworkButton resource={resource} state={state} />
      ) : null}
    </div>
  </>
);
