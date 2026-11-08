import { FC } from 'react';
import { NestedPartition } from 'waldur-js-client';

import { PropertyItem, PropertyList } from 'waldur-ui';

import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import { ExpandableContainer } from '@/table/ExpandableContainer';

interface OwnProps {
  row: NestedPartition;
}

export const OfferingPartitionExpandableRow: FC<OwnProps> = ({ row }) => (
  <ExpandableContainer>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-5">
      <div>
        <PropertyList variant="summary" space={1.5} hideIfEmpty={false}>
          <PropertyItem
            label={translate('CPU architecture')}
            value={row.cpu_arch}
          />
          <PropertyItem
            label={translate('GPU architecture')}
            value={row.gpu_arch}
          />
          <PropertyItem
            label={translate('Default task binding policy (SLURM cpu_bind)')}
            value={row.cpu_bind}
          />
          <PropertyItem
            label={translate('Default CPUs allocated per GPU')}
            value={row.def_cpu_per_gpu}
          />
          <PropertyItem
            label={translate('Maximum allocated CPUs per node')}
            value={row.max_cpus_per_node}
          />
          <PropertyItem
            label={translate('Maximum allocated CPUs per socket')}
            value={row.max_cpus_per_socket}
          />
          <PropertyItem
            label={translate('Default memory per CPU')}
            value={row.def_mem_per_cpu}
          />
          <PropertyItem
            label={translate('Default memory per GPU')}
            value={row.def_mem_per_gpu}
          />
          <PropertyItem
            label={translate('Default memory per node')}
            value={row.def_mem_per_node}
          />
          <PropertyItem
            label={translate('Maximum memory per CPU')}
            value={row.max_mem_per_cpu}
          />
          <PropertyItem
            label={translate('Maximum memory per node')}
            value={row.max_mem_per_node}
          />
        </PropertyList>
      </div>
      <div>
        <PropertyList variant="summary" space={1.5} hideIfEmpty={false}>
          <PropertyItem
            label={translate('Preemption grace time in seconds')}
            value={row.grace_time}
          />
          <PropertyItem
            label={translate('Maximum nodes per job')}
            value={row.max_nodes}
          />
          <PropertyItem
            label={translate('Minimum nodes per job')}
            value={row.min_nodes}
          />
          <PropertyItem
            label={translate('Exclusive topology access required')}
            value={propVal.boolean(row.exclusive_topo, { wording: 'enabled' })}
          />
          <PropertyItem
            label={translate('Exclusive user access required')}
            value={propVal.boolean(row.exclusive_user, { wording: 'enabled' })}
          />
          <PropertyItem
            label={translate('Priority tier for scheduling and preemption')}
            value={row.priority_tier}
          />
          <PropertyItem
            label={translate('Allowed QoS')}
            value={
              row.qos_options?.length
                ? row.qos_options
                    .map((o) =>
                      o.is_default
                        ? `${o.qos_name} (${translate('default')})`
                        : o.qos_name,
                    )
                    .join(', ')
                : translate('All')
            }
          />
          <PropertyItem
            label={translate('Require reservation for job allocation')}
            value={propVal.boolean(row.req_resv, { wording: 'enabled' })}
          />
        </PropertyList>
      </div>
    </div>
  </ExpandableContainer>
);
