import { CopyIcon, TrashIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useField } from 'react-final-form';

import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';
import { ActionButton } from '@/table/ActionButton';

import { SelectField } from './SelectField';

export const FloatingIpRow = ({ name, subnets, floatingIps, onRemove }) => {
  const {
    input: { value: pair },
  } = useField(name);

  const { showSuccess } = useNotify();

  const onClick = useCallback((value) => {
    navigator.clipboard.writeText(value).then(() => {
      showSuccess(translate('Text has been copied'));
    });
  }, []);
  return (
    <tr>
      <td className="col-md-6 ps-0">
        {pair.address ? (
          <div className="btn-text-align">{pair.subnet_name}</div>
        ) : (
          <SelectField name={`${name}.subnet`} options={subnets} />
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
            name={`${name}.floating_ip`}
            options={floatingIps}
            disabled={!pair.subnet}
          />
        )}
      </td>
      <td>
        <ActionButton
          action={onRemove}
          title={translate('Remove')}
          iconNode={<TrashIcon weight="bold" />}
          variant="text-secondary"
        />
      </td>
    </tr>
  );
};
