import React from 'react';
import { Button, Table } from 'react-bootstrap';
import { Field } from 'redux-form';

import { renderValidationWrapper } from '@waldur/form/FieldValidationWrapper';
import { InputField } from '@waldur/form/InputField';
import { translate } from '@waldur/i18n';

import { validateIPv4 } from '../utils';

const ValidatedInputField = renderValidationWrapper(InputField);

const IPAddressRow = ({ address, onRemove }) => (
  <tr>
    <td>
      <Field
        name={address}
        component={ValidatedInputField}
        validate={validateIPv4}
      />
    </td>
    <td>
      <Button variant="default" onClick={onRemove} size="sm">
        <i className="fa fa-trash" /> {translate('Remove')}
      </Button>
    </td>
  </tr>
);

const IPAddressAddButton = ({ onClick }) => (
  <Button variant="default" onClick={onClick} size="sm">
    <i className="fa fa-plus" /> {translate('Add address')}
  </Button>
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
