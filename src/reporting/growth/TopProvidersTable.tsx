import { FC, useCallback } from 'react';
import { Table } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { ChartCard } from '@waldur/reporting/users/charts/ChartCard';

interface TopProvidersTableProps {
  data: any[];
}

const TOP_COUNT = 5;

export const TopProvidersTable: FC<TopProvidersTableProps> = ({ data }) => {
  const getExportData = useCallback(
    () => ({
      fields: [
        translate('Service provider'),
        translate('Resources'),
        translate('Projects'),
      ],
      data: (data || []).map((sp: any) => [
        sp.customer_name,
        sp.resources_count || 0,
        sp.projects_count || 0,
      ]),
    }),
    [data],
  );

  return (
    <ChartCard
      title={translate('Top 5 Service providers')}
      getExportData={getExportData}
      isEmpty={!data || data.length === 0}
    >
      {() => (
        <Table responsive className="align-middle table-row-dashed fs-6 gy-5">
          <thead>
            <tr className="text-start text-gray-400 fw-bold fs-7 text-uppercase gs-0">
              <th className="min-w-150px">{translate('Service provider')}</th>
              <th className="text-end min-w-100px">{translate('Resources')}</th>
              <th className="text-end min-w-100px">{translate('Projects')}</th>
            </tr>
          </thead>
          <tbody className="fw-semibold text-gray-600">
            {(data || []).slice(0, TOP_COUNT).map((sp: any) => (
              <tr key={sp.customer_uuid}>
                <td>{sp.customer_name}</td>
                <td className="text-end">{sp.resources_count || 0}</td>
                <td className="text-end">{sp.projects_count || 0}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </ChartCard>
  );
};
