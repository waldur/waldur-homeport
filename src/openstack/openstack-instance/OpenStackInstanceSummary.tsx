import { translate } from '@waldur/i18n';
import { OpenStackSecurityGroupsLink } from '@waldur/openstack/openstack-security-groups/OpenStackSecurityGroupsLink';
import { ResourceLink } from '@waldur/resource/ResourceLink';
import {
  Field,
  ResourceSummaryProps,
  PureVirtualMachineSummary,
} from '@waldur/resource/summary';
import { Volume } from '@waldur/resource/types';

import { OpenStackInstanceVolumeBadge } from './OpenStackInstanceVolumeBadge';
import { OpenStackInstance } from './types';

const formatSecurityGroups = (props) => {
  if (props.resource.security_groups) {
    return (
      <OpenStackSecurityGroupsLink items={props.resource.security_groups} />
    );
  } else {
    return null;
  }
};

const VolumeBadges = ({
  volumes,
  resource,
}: {
  volumes: Volume[];
  resource?: OpenStackInstance;
}) => {
  return (
    <div className="d-flex flex-wrap-wrap">
      {volumes.map((volume) => (
        <OpenStackInstanceVolumeBadge
          key={volume.uuid}
          volume={volume}
          resourceName={resource.name}
        />
      ))}
    </div>
  );
};

export const OpenStackInstanceSummary = (
  props: ResourceSummaryProps<OpenStackInstance>,
) => {
  return (
    <>
      <PureVirtualMachineSummary {...props} />
      <Field
        label={translate('Security groups')}
        value={formatSecurityGroups(props)}
        valueClass="text-decoration-underline"
      />
      <Field
        label={translate('Availability zone')}
        value={props.resource.availability_zone_name}
      />
      <Field
        label={translate('Hypervisor')}
        value={props.resource.hypervisor_hostname}
      />
      {props.resource.rancher_cluster && (
        <Field
          label={translate('Rancher cluster')}
          value={
            <ResourceLink
              uuid={props.resource.rancher_cluster.marketplace_uuid}
              label={props.resource.rancher_cluster.name}
            />
          }
        />
      )}

      {props.resource?.volumes?.length > 0 && (
        <Field
          label={translate('Attached')}
          value={
            <VolumeBadges
              volumes={props.resource.volumes}
              resource={props.resource}
            />
          }
          className="mt-4"
          isStuck
        />
      )}
    </>
  );
};
