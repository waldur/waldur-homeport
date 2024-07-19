import { FunctionComponent, useMemo } from 'react';
import { Table } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { OfferingComponent } from '@waldur/marketplace/types';

import { ComponentUsage } from './types';
import { getTableData } from './utils';

interface ResourceUsageTableProps {
  offeringComponent: OfferingComponent;
  usages: ComponentUsage[];
}

export const ResourceUsageTable: FunctionComponent<ResourceUsageTableProps> = ({
  offeringComponent,
  usages,
}) => {
  const rows = useMemo(() => {
    return getTableData(offeringComponent, usages);
  }, [offeringComponent, usages]);

  return (
    <Table className="mt-4">
      <thead>
        <tr className="bg-gray-50">
          <th className="w-50">{translate('Date')}</th>
          <th>
            {offeringComponent.name + '/' + offeringComponent.measured_unit}
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((item) => (
          <tr key={item.date} className="border-top">
            <td>{item.date}</td>
            <td>{item.usage}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};
