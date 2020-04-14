import * as React from 'react';
import * as Table from 'react-bootstrap/lib/Table';

import { translate } from '@waldur/i18n';

export const KeyValueTable = props => (
  <Table bordered={true}>
    <thead>
      <tr>
        <th>{translate('Key')}</th>
        <th>{translate('Value')}</th>
      </tr>
    </thead>
    <tbody>
      {Object.keys(props.items).map(key => (
        <tr key={key}>
          <td>{key}</td>
          <td>
            {typeof props.items[key] === 'object'
              ? JSON.stringify(props.items[key])
              : props.items[key]}
          </td>
        </tr>
      ))}
    </tbody>
  </Table>
);
