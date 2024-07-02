import { FC, useMemo } from 'react';

import { formatPhoneNumber } from '@waldur/core/utils';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';

import { FieldEditButton } from './FieldEditButton';
import { CustomerEditPanelProps } from './types';

export const CustomerContactPanel: FC<CustomerEditPanelProps> = (props) => {
  const rows = useMemo(
    () => [
      {
        label: translate('Email'),
        key: 'email',
        value: props.customer.email,
      },
      {
        label: translate('Phone number'),
        key: 'phone_number',
        value: formatPhoneNumber(props.customer.phone_number),
      },
      {
        label: translate('Contact details'),
        key: 'contact_details',
        value: props.customer.contact_details,
      },
      {
        label: translate('Homepage'),
        key: 'homepage',
        value: props.customer.homepage,
      },
    ],
    [props.customer],
  );

  return (
    <FormTable.Card className="card-bordered">
      <FormTable>
        {rows.map((row) => (
          <FormTable.Item
            key={row.key}
            label={row.label}
            value={row.value || 'N/A'}
            actions={
              <FieldEditButton
                customer={props.customer}
                name={row.key}
                callback={props.callback}
              />
            }
          />
        ))}
      </FormTable>
    </FormTable.Card>
  );
};
