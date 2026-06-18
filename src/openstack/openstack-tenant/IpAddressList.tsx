import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import React from 'react';
import { Table } from 'react-bootstrap';
import { Field } from 'react-final-form';

import { FieldError } from '@/form/FieldError';
import { BaseInputField } from '@/form/InputField';
import { translate } from '@/i18n';
import { CompactActionButton } from '@/table/CompactActionButton';

import { validateIPv4 } from '../utils';

const IPAddressRow = ({ address, onRemove }) => (
  <tr>
    <td>
      <Field name={address} validate={validateIPv4}>
        {({ input, meta }) => (
          <>
            <BaseInputField {...input} aria-label={translate('IP address')} />
            <FieldError error={meta.touched && meta.error} />
          </>
        )}
      </Field>
    </td>
    <td>
      <CompactActionButton
        title={translate('Remove')}
        action={onRemove}
        iconNode={<TrashIcon weight="bold" />}
        variant="text-secondary"
      />
    </td>
  </tr>
);

const IPAddressAddButton = ({ onClick }) => (
  <CompactActionButton
    title={translate('Add address')}
    action={onClick}
    iconNode={<PlusIcon weight="bold" />}
    variant="text-secondary"
  />
);

export const IpAddressList: React.FC<any> = ({ fields }) => (
  <>
    {fields.length > 0 ? (
      <>
        <Table
          responsive={true}
          bordered={true}
          striped={true}
          className="mt-3"
        >
          <thead>
            <tr>
              <th>{translate('IP address')}</th>
              <th>{translate('Actions')}</th>
            </tr>
          </thead>

          <tbody>
            {fields.map((address, index) => (
              <IPAddressRow
                key={address}
                address={address}
                onRemove={() => fields.remove(index)}
              />
            ))}
          </tbody>
        </Table>
        <IPAddressAddButton onClick={() => fields.push('')} />
      </>
    ) : (
      <IPAddressAddButton onClick={() => fields.push('')} />
    )}
  </>
);
