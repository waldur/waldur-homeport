import { FC, useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';
import { CustomerMemberCount } from 'waldur-js-client';

import { ChartCard } from '@/core/ChartCard';
import { translate } from '@/i18n';
import { BooleanField } from '@/table/BooleanField';
import { SimpleTable } from '@/table/SimpleTable';
import { Column } from '@/table/types';
import { getSimpleExportData } from '@/table/utils';

interface RoleDistributionTableProps {
  data: CustomerMemberCount[];
}

const columns: Column<CustomerMemberCount>[] = [
  {
    title: translate('Organization'),
    render: ({ row }) => (
      <div>
        <span>{row.name}</span>
        {row.abbreviation && (
          <span className="text-quaternary ms-1.5">({row.abbreviation})</span>
        )}
      </div>
    ),
  },
  {
    title: translate('Members'),
    render: ({ row }) => (
      <span className="font-medium">
        {row.count != null ? row.count.toLocaleString() : '—'}
      </span>
    ),
  },
  {
    title: translate('Has resources'),
    render: ({ row }) => <BooleanField value={row.has_resources} />,
  },
];

export const RoleDistributionTable: FC<RoleDistributionTableProps> = ({
  data,
}) => {
  const sortedData = useMemo(
    () => [...data].sort((a, b) => (b.count ?? 0) - (a.count ?? 0)),
    [data],
  );

  return (
    <Row>
      <Col>
        <ChartCard
          title={translate('Organization member counts')}
          getExportData={() => getSimpleExportData(columns, sortedData)}
          showPNG={false}
          isEmpty={!sortedData || sortedData.length === 0}
        >
          {() => (
            <SimpleTable<CustomerMemberCount>
              columns={columns}
              rows={sortedData}
            />
          )}
        </ChartCard>
      </Col>
    </Row>
  );
};
