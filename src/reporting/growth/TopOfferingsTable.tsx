import { FC, useCallback } from 'react';
import { Table } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { ChartCard } from '@waldur/reporting/users/charts/ChartCard';

interface TopOfferingsTableProps {
  data: any[];
}

const TOP_COUNT = 5;

export const TopOfferingsTable: FC<TopOfferingsTableProps> = ({ data }) => {
  const getExportData = useCallback(
    () => ({
      fields: [translate('Offering'), translate('Resources')],
      data: (data || []).map((offering: any) => [
        offering.name,
        offering.count || 0,
      ]),
    }),
    [data],
  );

  return (
    <ChartCard
      title={translate('Top 5 Offerings')}
      getExportData={getExportData}
      isEmpty={!data || data.length === 0}
    >
      {() => (
        <Table responsive className="align-middle table-row-dashed fs-6 gy-5">
          <thead>
            <tr className="text-start text-gray-400 fw-bold fs-7 text-uppercase gs-0">
              <th className="min-w-150px">{translate('Offering')}</th>
              <th className="text-end min-w-100px">{translate('Resources')}</th>
            </tr>
          </thead>
          <tbody className="fw-semibold text-gray-600">
            {(data || []).slice(0, TOP_COUNT).map((offering: any) => (
              <tr key={offering.uuid}>
                <td>{offering.name}</td>
                <td className="text-end">{offering.count || 0}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </ChartCard>
  );
};
