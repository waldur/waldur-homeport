import * as React from 'react';

import { withTranslation } from '@waldur/i18n';
import { OpenStackSecurityGroupsLink } from '@waldur/openstack/openstack-security-groups/OpenStackSecurityGroupsLink';
import { ZabbixHostField } from '@waldur/resource/monitoring/ZabbixHostField';
import { ResourceLink } from '@waldur/resource/ResourceLink';
import {
  Field,
  ResourceSummaryProps,
  PureVirtualMachineSummary,
} from '@waldur/resource/summary';

import { OpenStackInstance } from './types';

const formatSecurityGroups = props => {
  if (props.resource.security_groups) {
    return (
      <OpenStackSecurityGroupsLink items={props.resource.security_groups} />
    );
  } else {
    return null;
  }
};

const PureOpenStackInstanceSummary = (
  props: ResourceSummaryProps<OpenStackInstance>,
) => {
  const { translate } = props;
  return (
    <span>
      <PureVirtualMachineSummary {...props} />
      <Field
        label={translate('Security groups')}
        value={formatSecurityGroups(props)}
      />
      <Field
        label={translate('Availability zone')}
        value={props.resource.availability_zone_name}
      />
      {props.resource.rancher_cluster && (
        <Field
          label={translate('Rancher cluster')}
          value={
            <ResourceLink
              type="Rancher.Cluster"
              uuid={props.resource.rancher_cluster.uuid}
              label={props.resource.rancher_cluster.name}
            />
          }
        />
      )}
      <ZabbixHostField {...props} />
    </span>
  );
};

export const OpenStackInstanceSummary = withTranslation(
  PureOpenStackInstanceSummary,
);
