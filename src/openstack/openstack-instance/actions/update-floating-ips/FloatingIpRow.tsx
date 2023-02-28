import copy from 'copy-to-clipboard';
import { useCallback } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { showSuccess } from '@waldur/store/notify';

import { SelectField } from './SelectField';
import { getPairSelector } from './utils';

export const FloatingIpRow = ({ row, subnets, floatingIps, onRemove }) => {
  const pair = useSelector(getPairSelector(row));

  const dispatch = useDispatch();

  const onClick = useCallback(
    (value) => {
      copy(value);
      dispatch(showSuccess(translate('Text has been copied')));
    },
    [dispatch],
  );
  return (
    <tr>
      <td className="col-md-6 ps-0">
        {pair.address ? (
          <div className="btn-text-align">{pair.subnet_name}</div>
        ) : (
          <SelectField name="subnet" options={subnets} />
        )}
      </td>
      <td className="col-md-5">
        {pair.address ? (
          <div className="btn-text-align">
            <a onClick={() => onClick(pair.address)} className="pe-3">
              <Tip label={translate('Copy to clipboard')} id="copyToClipboard">
                <i className="fa fa-copy fa-lg" />
              </Tip>
            </a>
            {pair.address}
          </div>
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
          variant="default"
          title={translate('Delete')}
          onClick={onRemove}
        >
          <i className="fa fa-trash-o"></i>
        </Button>
      </td>
    </tr>
  );
};
