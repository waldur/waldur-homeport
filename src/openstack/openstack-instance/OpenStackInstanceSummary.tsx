import { OpenStackNestedVolume } from 'waldur-js-client';
import { OpenStackInstance } from 'waldur-js-client';

import { PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { OpenStackSecurityGroupsLink } from '@/openstack/openstack-security-groups/OpenStackSecurityGroupsLink';
import { propVal } from '@/property/propertyFields';
import {
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
    <div className="flex flex-wrap">
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
      <PropertyItem
        label={translate('Security groups')}
        value={formatSecurityGroups(props)}
        valueClass="underline"
      />

      {props.resource.server_group && (
        <PropertyItem
          label={translate('Server group')}
          value={`${props.resource.server_group.name} (${props.resource.server_group.policy})`}
        />
      )}

      <PropertyItem
        label={translate('Availability zone')}
        value={props.resource.availability_zone_name}
      />

      <PropertyItem
        label={translate('Hypervisor')}
        value={props.resource.hypervisor_hostname}
      />

      <PropertyItem
        label={translate('Config drive')}
        value={propVal.boolean(props.resource.config_drive, {
          wording: 'enabled',
        })}
      />

      {props.resource.rancher_cluster && (
        <PropertyItem
          label={translate('Rancher cluster')}
          value={propVal.link(props.resource.rancher_cluster.name, {
            state: 'marketplace-resource-details',
            params: {
              resource_uuid: props.resource.rancher_cluster.marketplace_uuid,
            },
          })}
        />
      )}

      {props.resource?.volumes?.length > 0 && (
        <PropertyItem
          label={translate('Attached')}
          value={
            <VolumeBadges
              volumes={props.resource.volumes}
              resource={props.resource}
            />
          }
          className="mt-3"
        />
      )}
    </>
  );
};
