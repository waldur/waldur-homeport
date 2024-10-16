import { Table } from 'react-bootstrap';

import { StateIndicator } from '@waldur/core/StateIndicator';
import { translate } from '@waldur/i18n';

import { ChecklistStats } from './types';

export const StatsTable = ({
  stats,
  scopeTitle,
}: {
  stats: ChecklistStats[];
  scopeTitle: string;
}) => (
  <Table responsive={true} bordered={true} striped={true} className="mt-3">
    <thead>
      <tr>
        <th className="col-sm-1">#</th>
        <th>{scopeTitle}</th>
        <th>{translate('Score')}</th>
      </tr>
    </thead>
    <tbody>
      {stats.map((customer, index) => (
        <tr key={customer.uuid}>
          <td>{index + 1}</td>
          <td>{customer.name}</td>
          <td>
            <StateIndicator
              label={`${customer.score} %`}
              variant={
                customer.score < 25
                  ? 'danger'
                  : customer.score < 75
                    ? 'warning'
                    : 'primary'
              }
              outline
              pill
            />
          </td>
        </tr>
      ))}
    </tbody>
  </Table>
);
