import { FC, useEffect } from 'react';
import { ProgressBar, Stack } from 'react-bootstrap';
import { ServiceProviderComplianceOverview } from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { translate } from '@waldur/i18n';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

const dummyData = [
  { offering_name: 'Offering #1', overall_score: 82, status: 'Overdue' },
  { offering_name: 'Offering #2', overall_score: 82, status: 'In progress' },
  { offering_name: 'Offering #3', overall_score: 82, status: 'Not started' },
  { offering_name: 'Offering #4', overall_score: 82, status: 'Completed' },
];

export const ComplianceExpandableRow: FC<{
  row: ServiceProviderComplianceOverview;
}> = ({ row: compliance }) => {
  const tableProps = useTable({
    table: 'ProviderComplianceOverview-' + compliance.checklist_name, // FIX THIS: does not have uuid?
    fetchData: () =>
      Promise.resolve({
        rows: dummyData,
      }),
  });

  useEffect(() => {
    tableProps.fetch();
  }, [compliance]);

  return (
    <ExpandableContainer>
      <Table
        {...tableProps}
        columns={[
          {
            title: translate('Offering'),
            render: ({ row }) => (
              <span className="text-dark">{row.offering_name}</span>
            ),
          },
          {
            title: translate('Overall score'),
            render: ({ row }) => (
              <Stack>
                <ProgressBar
                  now={row.overall_score}
                  className="h-8px shadow-none w-100 mt-1"
                />
                <small className="d-block text-end text-gray-700">
                  {row.overall_score}%
                </small>
              </Stack>
            ),
          },
          {
            title: translate('Status'),
            render: ({ row }) => (
              <Badge variant="default" pill outline>
                {row.status}
              </Badge>
            ),
          },
        ]}
        verboseName={translate('Offering compliances')}
        hasActionBar={false}
        minHeight="auto"
      />
    </ExpandableContainer>
  );
};
