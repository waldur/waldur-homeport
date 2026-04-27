import { OpenStackNestedVolume } from 'waldur-js-client';
import { OpenStackInstance } from 'waldur-js-client';

import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { OpenStackSecurityGroupsLink } from '@/openstack/openstack-security-groups/OpenStackSecurityGroupsLink';
import { ResourceLink } from '@/resource/ResourceLink';
import {
  Field,
  ResourceSummaryProps,
  PureVirtualMachineSummary,
} from '@/resource/summary';

import { OpenStackInstanceVolumeBadge } from './OpenStackInstanceVolumeBadge';

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
  volumes: OpenStackNestedVolume[];
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
  const Component = props.formTableItem ? FormTable.Item : Field;
  return (
    <>
      <PureVirtualMachineSummary {...props} />
      <Component
        label={translate('Security groups')}
        value={formatSecurityGroups(props)}
        valueClass="text-decoration-underline"
      />

      {props.resource.server_group && (
        <Component
          label={translate('Server group')}
          value={`${props.resource.server_group.name} (${props.resource.server_group.policy})`}
        />
      )}

      <Component
        label={translate('Availability zone')}
        value={props.resource.availability_zone_name}
      />

      <Component
        label={translate('Hypervisor')}
        value={props.resource.hypervisor_hostname}
      />

      {props.resource.rancher_cluster && (
        <Component
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
        <Component
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
