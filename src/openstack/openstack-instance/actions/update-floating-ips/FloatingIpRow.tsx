import { CopyIcon, TrashIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useField } from 'react-final-form';

import { BaseButton, TableCell, TableRow, Tooltip } from 'waldur-ui';

import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';

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
    <TableRow divided={false} hoverable={false}>
      <TableCell className="md:w-6/12 ps-0">
        {pair.address ? (
          <div className="btn-text-align">{pair.subnet_name}</div>
        ) : (
          <SelectField name={`${name}.subnet`} options={subnets} />
        )}
      </TableCell>
      <TableCell className="md:w-5/12">
        {pair.address ? (
          <div className="btn-text-align">
            <button
              onClick={() => onClick(pair.address)}
              type="button"
              className="bg-transparent border-0 p-0 m-0 cursor-pointer text-quaternary hover:text-secondary pe-2.5 inline-flex items-center"
            >
              <Tooltip label={translate('Copy to clipboard')}>
                <CopyIcon size={20} weight="bold" />
              </Tooltip>
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
      </TableCell>
      <TableCell>
        <BaseButton
          onClick={onRemove}
          label={translate('Remove')}
          iconNode={<TrashIcon weight="bold" />}
          variant="text-secondary"
          size="lg"
        />
      </TableCell>
    </TableRow>
  );
};
