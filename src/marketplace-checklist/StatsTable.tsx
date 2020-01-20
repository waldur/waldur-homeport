import * as React from 'react';
import * as Table from 'react-bootstrap/lib/Table';

import { translate } from '@waldur/i18n';

export const StatsTable = props => (
  <Table
    responsive={true}
    bordered={true}
    striped={true}
    className="m-t-md"
  >
    <thead>
      <tr>
        <th className="col-sm-1">#</th>
        <th>{translate('Organization')}</th>
        <th>{translate('Score')}</th>
        <th>{translate('Latitude')}</th>
        <th>{translate('Longitude')}</th>
      </tr>
    </thead>
    <tbody>
      {props.stats.map((customer, index) => (
        <tr key={customer.uuid}>
          <td>
            {index + 1}
          </td>
          <td>
            {customer.name}
          </td>
          <td>
            {customer.score}
          </td>
          <td>
            {customer.latitude}
          </td>
          <td>
            {customer.longitude}
          </td>
        </tr>
      ))}
    </tbody>
  </Table>
);
