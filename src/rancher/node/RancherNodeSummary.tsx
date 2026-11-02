import type { RancherNode } from 'waldur-js-client';

import { PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { KeyValueButton } from '@/marketplace/resources/KeyValueButton';
import { propVal } from '@/property/propertyFields';
import { ResourceSummaryProps } from '@/resource/summary';

import { getNodeRoleLabels } from './nodeRoles';

export const RancherNodeSummary = (
  props: ResourceSummaryProps<RancherNode>,
) => {
  return (
    <>
      <PropertyItem
        label={translate('Kubernetes version')}
        value={props.resource.k8s_version}
      />

      <PropertyItem
        label={translate('Roles')}
        value={propVal.enum(props.resource.role, {
          labels: getNodeRoleLabels(),
        })}
      />

      <PropertyItem
        label={translate('Docker version')}
        value={props.resource.docker_version}
      />

      <PropertyItem
        label={translate('CPU')}
        value={propVal.meter(
          props.resource.cpu_allocated,
          props.resource.cpu_total,
          {
            unit: 'cores',
            showPercent: true,
          },
        )}
      />

      <PropertyItem
        label={translate('RAM')}
        value={propVal.meter(
          props.resource.ram_allocated,
          props.resource.ram_total,
          {
            unit: 'MiB',
            showPercent: true,
          },
        )}
      />

      <PropertyItem
        label={translate('Pods')}
        value={propVal.meter(
          props.resource.pods_allocated,
          props.resource.pods_total,
          {
            showPercent: true,
          },
        )}
      />

      <PropertyItem
        label={translate('Labels')}
        value={
          Object.keys(props.resource.labels).length > 0 && (
            <KeyValueButton
              items={props.resource.labels}
              title={translate('Labels')}
            />
          )
        }
      />

      <PropertyItem
        label={translate('Annotations')}
        value={
          Object.keys(props.resource.annotations).length > 0 && (
            <KeyValueButton
              items={props.resource.annotations}
              title={translate('Annotations')}
            />
          )
        }
      />

      <PropertyItem
        label={translate('OpenStack instance')}
        value={
          props.resource.instance_marketplace_uuid
            ? propVal.link(props.resource.instance_name, {
                state: 'marketplace-resource-details',
                params: {
                  resource_uuid: props.resource.instance_marketplace_uuid,
                },
              })
            : null
        }
      />
    </>
  );
};
