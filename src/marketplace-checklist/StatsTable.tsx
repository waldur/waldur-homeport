import * as React from 'react';
import * as Table from 'react-bootstrap/lib/Table';

import { StateIndicator } from '@waldur/core/StateIndicator';
import { translate } from '@waldur/i18n';

import { ChecklistStats } from './types';

export const StatsTable = ({ stats }: { stats: ChecklistStats[] }) => (
  <Table responsive={true} bordered={true} striped={true} className="m-t-md">
    <thead>
      <tr>
        <th className="col-sm-1">#</th>
        <th>{translate('Organization')}</th>
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
            />
          </td>
        </tr>
      ))}
    </tbody>
  </Table>
);
