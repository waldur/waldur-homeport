import { FunctionComponent } from 'react';
import { Table } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

export const KeyValueTable: FunctionComponent<any> = (props) => (
  <Table
    bordered={true}
    className="table align-middle table-row-bordered fs-6 gy-4 no-footer"
  >
    <thead>
      <tr className="align-middle">
        <th>{translate('Key')}</th>
        <th>{translate('Value')}</th>
      </tr>
    </thead>
    <tbody>
      {Object.keys(props.items).map((key) => (
        <tr key={key}>
          <td>{key}</td>
          <td>
            {typeof props.items[key] === 'object' &&
            props.items[key] !== null ? (
              <pre>{JSON.stringify(props.items[key], null, 2)}</pre>
            ) : typeof props.items[key] === 'boolean' ? (
              props.items[key] ? (
                translate('True')
              ) : (
                translate('False')
              )
            ) : (
              props.items[key]
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </Table>
);
