import React from 'react';
import { Button, Table } from 'react-bootstrap';
import { Field, WrappedFieldArrayProps } from 'redux-form';

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
      <Button bsStyle="default" onClick={onRemove} bsSize="small">
        <i className="fa fa-trash" /> {translate('Remove')}
      </Button>
    </td>
  </tr>
);

const IPAddressAddButton = ({ onClick }) => (
  <Button bsStyle="default" onClick={onClick} bsSize="small">
    <i className="fa fa-plus" /> {translate('Add address')}
  </Button>
);

export const IpAddressList: React.FC<WrappedFieldArrayProps> = ({ fields }) => (
  <>
    {fields.length > 0 ? (
      <>
        <Table
          responsive={true}
          bordered={true}
          striped={true}
          className="m-t-md"
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
