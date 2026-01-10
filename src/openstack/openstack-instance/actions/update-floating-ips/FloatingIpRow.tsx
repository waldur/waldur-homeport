import { CopyIcon, TrashIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';

import { SelectField } from './SelectField';
import { getPairSelector } from './utils';

export const FloatingIpRow = ({ row, subnets, floatingIps, onRemove }) => {
  const pair = useSelector(getPairSelector(row));

  const dispatch = useDispatch();

  const onClick = useCallback(
    (value) => {
      navigator.clipboard.writeText(value).then(() => {
        dispatch(showSuccess(translate('Text has been copied')));
      });
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
            <button
              onClick={() => onClick(pair.address)}
              type="button"
              className="text-btn pe-3"
            >
              <Tip label={translate('Copy to clipboard')} id="copyToClipboard">
                <CopyIcon size={20} weight="bold" />
              </Tip>
            </button>
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
        <ActionButton
          action={onRemove}
          tooltip={translate('Delete')}
          iconNode={<TrashIcon weight="bold" />}
          variant="text-secondary"
        />
      </td>
    </tr>
  );
};
