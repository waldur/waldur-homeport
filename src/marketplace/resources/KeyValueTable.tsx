import { FunctionComponent } from 'react';
import { Table } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

export const KeyValueTable: FunctionComponent<any> = (props) => (
  <Table
    bordered={true}
    className="table align-middle table-row-dashed fs-6 gy-5 dataTable no-footer"
  >
    <thead>
      <tr className="text-start text-muted bg-light fw-bolder fs-7 text-uppercase gs-0">
        <th>{translate('Key')}</th>
        <th>{translate('Value')}</th>
      </tr>
    </thead>
    <tbody>
      {Object.keys(props.items).map((key) => (
        <tr key={key}>
          <td>{key}</td>
          <td>
            {typeof props.items[key] === 'object' ? (
              <pre>{JSON.stringify(props.items[key], null, 2)}</pre>
            ) : (
              props.items[key]
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </Table>
);
