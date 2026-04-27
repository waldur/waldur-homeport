import { ProgressBar, Stack } from 'react-bootstrap';

import { translate } from '@/i18n';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

const orgPerformance = [
  { name: 'TechCorp Inc.', assigned: 18, compliance: 82, last: '2 hours ago' },
  {
    name: 'HealthPlus Systems',
    assigned: 4,
    compliance: 82,
    last: '1 day ago',
  },
  {
    name: 'FinanceFirst Bank',
    assigned: 45,
    compliance: 83,
    last: '3 days ago',
  },
];

export const OrgPerformanceTable = () => {
  const tableProps = useTable({
    table: 'OrganizationPerformanceComparison',
    fetchData: () => Promise.resolve({ rows: orgPerformance }),
  });

  return (
    <Table
      {...tableProps}
      title={translate('Organization performance comparison')}
      columns={[
        {
          title: translate('Organization name'),
          render: ({ row }) => row.name,
        },
        {
          title: translate('Assigned checklists'),
          render: ({ row }) => row.assigned,
        },
        {
          title: translate('Compliance rate'),
          render: ({ row }) => (
            <Stack>
              <ProgressBar
                now={row.compliance}
                className="h-8px shadow-none w-100 mt-1"
              />
              <small className="d-block text-end fw-bolder">
                {row.compliance}%
              </small>
            </Stack>
          ),
        },
        {
          title: translate('Last activity'),
          render: ({ row }) => row.last,
        },
      ]}
      hideRefresh
      minHeight="auto"
      headerClassName="min-h-60px"
    />
  );
};
