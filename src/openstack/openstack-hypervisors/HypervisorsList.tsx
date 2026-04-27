import { CSSProperties, FC } from 'react';
import { Stack } from 'react-bootstrap';
import {
  Hypervisor,
  openstackHypervisorsList,
  OpenstackHypervisorsListData,
} from 'waldur-js-client';

import { ProgressBar } from '@/core/ProgressBar';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { toGb } from './utils';

const UsageCell: FC<{ used: number; total: number; unit?: string }> = ({
  used,
  total,
  unit,
}) => (
  <Stack
    style={
      {
        minWidth: 120,
        '--progress-bar-color': 'var(--waldur-utility-indigo-400)',
        '--progress-track-color': 'var(--waldur-utility-blue-400)',
      } as CSSProperties
    }
  >
    <ProgressBar now={used} max={total} className="progress-themed" />
    <span className="text-end fs-7 text-secondary mt-1">
      {used}/{total}
      {unit ? ` ${unit}` : ''}
    </span>
  </Stack>
);

export const HypervisorsList: FC<{
  filter: OpenstackHypervisorsListData['query'];
}> = ({ filter }) => {
  const props = useTable({
    table: 'openstack-hypervisors',
    fetchData: createFetcher(openstackHypervisorsList),
    filter,
    queryField: 'name',
  });

  return (
    <Table<Hypervisor>
      {...props}
      columns={[
        {
          title: translate('Hostname'),
          render: ({ row }) => row.name,
          copyField: (row) => row.name,
          id: 'name',
          keys: ['name'],
        },
        {
          title: translate('Description'),
          render: ({ row }) => row.hypervisor_type || DASH_ESCAPE_CODE,
          id: 'hypervisor_type',
          keys: ['hypervisor_type'],
        },
        {
          title: translate('VCPU'),
          render: ({ row }) => (
            <UsageCell used={row.vcpus_used ?? 0} total={row.vcpus ?? 0} />
          ),
          id: 'vcpus',
          keys: ['vcpus', 'vcpus_used'],
        },
        {
          title: translate('RAM'),
          render: ({ row }) => (
            <UsageCell
              used={toGb(row.memory_mb_used ?? 0)}
              total={toGb(row.memory_mb ?? 0)}
              unit="GB"
            />
          ),
          id: 'memory_mb',
          keys: ['memory_mb', 'memory_mb_used'],
        },
      ]}
      title={translate('Hypervisors')}
      verboseName={translate('hypervisors')}
      hasQuery={true}
      showPageSizeSelector
      hideRefresh
    />
  );
};
