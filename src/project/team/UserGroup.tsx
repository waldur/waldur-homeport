import * as React from 'react';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';
import { SelectField } from '@waldur/issues/create/SelectField';

export const UserGroup = ({ editUser, users, disabled }) =>
  editUser ? (
    <FormGroup>
      <FormControl.Static>
        <strong>{translate('User')}</strong>:{' '}
        {editUser.full_name || editUser.username}
      </FormControl.Static>
    </FormGroup>
  ) : users?.length ? (
    <FormGroup>
      <ControlLabel>{translate('User')}</ControlLabel>
      <Field
        name="user"
        component={SelectField}
        disabled={disabled}
        options={users}
        isClearable={true}
        placeholder={translate('Select user...')}
        valueRenderer={(option) => option.full_name || option.username}
        optionRenderer={(option) => (
          <>
            <div>{option.full_name}</div>
            <small>
              {option.username && (
                <div>
                  {translate('Username')}: {option.username}
                </div>
              )}
              {option.email && (
                <div>
                  {translate('E-mail')}: {option.email}
                </div>
              )}
              {option.civil_number && (
                <div>
                  {translate('Civil number')}: {option.civil_number}
                </div>
              )}
            </small>
          </>
        )}
      />
    </FormGroup>
  ) : (
    <p className="text-danger">{translate('There are no available users.')}</p>
  );
