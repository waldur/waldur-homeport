import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';

import { SelectField } from './SelectField';
import { getPairSelector } from './utils';

export const FloatingIpRow = ({ row, subnets, floatingIps, onRemove }) => {
  const pair = useSelector(getPairSelector(row));
  return (
    <tr>
      <td className="col-md-6 p-l-n">
        {pair.address ? (
          pair.subnet_name
        ) : (
          <SelectField name="subnet" options={subnets} />
        )}
      </td>
      <td className="col-md-5">
        {pair.address ? (
          pair.address
        ) : (
          <SelectField
            name="floating_ip"
            options={floatingIps}
            disabled={!pair.subnet}
          />
        )}
      </td>
      <td>
        <Button
          bsStyle="default"
          title={translate('Delete')}
          onClick={onRemove}
        >
          <i className="fa fa-trash-o"></i>
        </Button>
      </td>
    </tr>
  );
};
