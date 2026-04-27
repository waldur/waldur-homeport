import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { KeyValueButton } from '@/marketplace/resources/KeyValueButton';
import { ResourceLink } from '@/resource/ResourceLink';
import { Field, ResourceSummaryProps } from '@/resource/summary';

import { NodeRoleField } from './NodeRoleField';

const formatInstance = (resource) =>
  resource.instance_marketplace_uuid ? (
    <ResourceLink
      uuid={resource.instance_marketplace_uuid}
      label={resource.instance_name}
    />
  ) : (
    <>&ndash;</>
  );

export const RancherNodeSummary = (props: ResourceSummaryProps) => {
  const Component = props.formTableItem ? FormTable.Item : Field;
  return (
    <>
      <Component
        label={translate('Kubernetes version')}
        value={props.resource.k8s_version}
      />

      <Component
        label={translate('Roles')}
        value={<NodeRoleField node={props.resource} />}
      />

      <Component
        label={translate('Docker version')}
        value={props.resource.docker_version}
      />

      <Component
        label={translate('CPU')}
        value={
          props.resource.cpu_allocated &&
          translate('{allocated} / {total} cores', {
            allocated: props.resource.cpu_allocated,
            total: props.resource.cpu_total,
          })
        }
      />

      <Component
        label={translate('RAM')}
        value={
          props.resource.ram_total &&
          translate('{allocated} / {total} MiB', {
            allocated: props.resource.ram_allocated,
            total: props.resource.ram_total,
          })
        }
      />

      <Component
        label={translate('Pods')}
        value={
          props.resource.pods_total &&
          `${props.resource.pods_allocated} / ${props.resource.pods_total}`
        }
      />

      <Component
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

      <Component
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

      <Component
        label={translate('OpenStack instance')}
        value={formatInstance(props.resource)}
      />
    </>
  );
};
