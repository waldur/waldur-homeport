import { FC, useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';

import { ChartCard } from '@waldur/core/ChartCard';
import { translate } from '@waldur/i18n';
import { SimpleTable } from '@waldur/table/SimpleTable';
import { Column } from '@waldur/table/types';
import { getSimpleExportData, renderFieldOrDash } from '@waldur/table/utils';

import { OrgTypeAggregation } from './types';

interface Props {
  data: OrgTypeAggregation[];
  componentTypes: string[];
}

export const UsageByOrgTypeTable: FC<Props> = ({ data, componentTypes }) => {
  const columns = useMemo<Column<OrgTypeAggregation>[]>(() => {
    const cols: Column<OrgTypeAggregation>[] = [
      {
        title: translate('Organization type'),
        render: ({ row }) => (
          <span className="fw-bold">
            {row.organization_type || translate('Unknown')}
          </span>
        ),
        export: (row) => row.organization_type || translate('Unknown'),
      },
      {
        title: translate('Total resources'),
        render: ({ row }) => (
          <span className="fw-semibold">
            {row.total_resources.toLocaleString()}
          </span>
        ),
        export: (row) => row.total_resources,
      },
      {
        title: translate('Total usage'),
        render: ({ row }) => (
          <span className="fw-semibold">
            {row.total_usage.toLocaleString()}
          </span>
        ),
        export: (row) => row.total_usage,
      },
    ];

    // Add dynamic columns for each component type
    componentTypes.forEach((type) => {
      cols.push({
        title: type,
        render: ({ row }) =>
          renderFieldOrDash(
            row.components[type] ? row.components[type].toLocaleString() : null,
          ),
        export: (row) => row.components[type] || 0,
      });
    });

    return cols;
  }, [componentTypes]);

  return (
    <Row>
      <Col>
        <ChartCard
          title={translate('Usage by organization type')}
          getExportData={() => getSimpleExportData(columns, data)}
          showPNG={false}
          isEmpty={!data || data.length === 0}
        >
          {() => (
            <SimpleTable<OrgTypeAggregation> columns={columns} rows={data} />
          )}
        </ChartCard>
      </Col>
    </Row>
  );
};
