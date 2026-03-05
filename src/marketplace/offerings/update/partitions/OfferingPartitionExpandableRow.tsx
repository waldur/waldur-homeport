import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';
import { NestedPartition } from 'waldur-js-client';

import { CheckOrX } from '@waldur/core/CheckOrX';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';
import { renderFieldOrDash } from '@waldur/table/utils';

interface OwnProps {
  row: NestedPartition;
}

export const OfferingPartitionExpandableRow: FC<OwnProps> = ({ row }) => (
  <ExpandableContainer asTable>
    <Row>
      <Col lg={6}>
        <Field
          label={translate('Default task binding policy (SLURM cpu_bind)')}
          value={renderFieldOrDash(row.cpu_bind)}
          space={2}
        />
        <Field
          label={translate('Default CPUs allocated per GPU')}
          value={row.def_cpu_per_gpu}
          space={2}
        />
        <Field
          label={translate('Maximum allocated CPUs per node')}
          value={row.max_cpus_per_node}
          space={2}
        />
        <Field
          label={translate('Maximum allocated CPUs per socket')}
          value={row.max_cpus_per_socket}
          space={2}
        />
        <Field
          label={translate('Default memory per CPU')}
          value={row.def_mem_per_cpu}
          space={2}
        />
        <Field
          label={translate('Default memory per GPU')}
          value={row.def_mem_per_gpu}
          space={2}
        />
        <Field
          label={translate('Default memory per node')}
          value={row.def_mem_per_node}
          space={2}
        />
        <Field
          label={translate('Maximum memory per CPU')}
          value={row.max_mem_per_cpu}
          space={2}
        />
        <Field
          label={translate('Maximum memory per node')}
          value={row.max_mem_per_node}
          space={2}
        />
      </Col>
      <Col lg={6}>
        <Field
          label={translate('Preemption grace time in seconds')}
          value={row.grace_time}
          space={2}
        />
        <Field
          label={translate('Maximum nodes per job')}
          value={row.max_nodes}
          space={2}
        />
        <Field
          label={translate('Minimum nodes per job')}
          value={row.min_nodes}
          space={2}
        />
        <Field
          label={translate('Exclusive topology access required')}
          value={<CheckOrX value={row.exclusive_topo} />}
          space={2}
        />
        <Field
          label={translate('Exclusive user access required')}
          value={<CheckOrX value={row.exclusive_user} />}
          space={2}
        />
        <Field
          label={translate('Priority tier for scheduling and preemption')}
          value={row.priority_tier}
          space={2}
        />
        <Field
          label={translate('Quality of service (QOS) name')}
          value={row.qos}
          space={2}
        />
        <Field
          label={translate('Require reservation for job allocation')}
          value={<CheckOrX value={row.req_resv} />}
          space={2}
        />
      </Col>
    </Row>
  </ExpandableContainer>
);
