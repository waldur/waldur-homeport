import * as React from 'react';

import { withTranslation } from '@waldur/i18n';
import { OpenStackSecurityGroupsLink } from '@waldur/openstack/openstack-security-groups/OpenStackSecurityGroupsLink';
import { ResourceMonitoringField } from '@waldur/resource/monitoring/ResourceMonitoringField';
import { Field, ResourceSummaryProps, PureVirtualMachineSummary } from '@waldur/resource/summary';

const formatSecurityGroups = props => {
  if (props.resource.security_groups) {
    return <OpenStackSecurityGroupsLink items={props.resource.security_groups}/>;
  } else {
    return null;
  }
};

const PureOpenStackInstanceSummary = (props: ResourceSummaryProps) => {
  const { translate } = props;
  return (
    <span>
      <PureVirtualMachineSummary {...props}/>
      <Field
        label={translate('Security groups')}
        value={formatSecurityGroups(props)}
      />
      <ResourceMonitoringField {...props}/>
    </span>
  );
};


export const OpenStackInstanceSummary = withTranslation(PureOpenStackInstanceSummary);
