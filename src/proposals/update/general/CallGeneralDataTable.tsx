import { Table } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

const dummyDate = [{ configKey: 'Reference', value: 'SOME SAMPLE VALUE' }];

export const CallGeneralDataTable = () => {
  return dummyDate.length === 0 ? (
    <div className="justify-content-center row">
      <div className="col-sm-4">
        <p className="text-center">{translate('Nothing to see here.')}</p>
      </div>
    </div>
  ) : (
    <Table bordered={true} hover={true} responsive={true}>
      <thead>
        <tr className="bg-light">
          <th>{translate('Configuration key')}</th>
          <th>{translate('Value')}</th>
        </tr>
      </thead>
      <tbody>
        {dummyDate.map((item, index) => (
          <tr key={index}>
            <td className="col-md-3">{item.configKey}</td>
            <td className="col-md-3">{item.value}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};
