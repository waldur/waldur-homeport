import * as React from 'react';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import { components } from 'react-select';
import { Field } from 'redux-form';

import { reactSelectMenuPortaling } from '@waldur/form/utils';
import { translate } from '@waldur/i18n';
import { SelectField } from '@waldur/issues/create/SelectField';

const Option = (props) => (
  <components.Option {...props}>
    <>
      <div>{props.data.full_name}</div>
      <small>
        {props.data.username && (
          <div>
            {translate('Username')}: {props.data.username}
          </div>
        )}
        {props.data.email && (
          <div>
            {translate('E-mail')}: {props.data.email}
          </div>
        )}
        {props.data.civil_number && (
          <div>
            {translate('Civil number')}: {props.data.civil_number}
          </div>
        )}
      </small>
    </>
  </components.Option>
);

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
        isDisabled={disabled}
        options={users}
        isClearable={true}
        components={{ Option }}
        placeholder={translate('Select user...')}
        getOptionValue={(option) => option.full_name || option.username}
        getOptionLabel={(option) => option.full_name || option.username}
        {...reactSelectMenuPortaling()}
      />
    </FormGroup>
  ) : (
    <p className="text-danger">{translate('There are no available users.')}</p>
  );
