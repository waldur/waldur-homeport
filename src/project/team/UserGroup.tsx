import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import { components } from 'react-select';

import { Tip } from '@waldur/core/Tooltip';
import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { translate } from '@waldur/i18n';
import { customerUsersAutocomplete } from '@waldur/project/team/api';

export const UserListOptionInline: FunctionComponent<any> = (props) => (
  <components.Option {...props}>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      {props.data.full_name}
      {props.data.email && <>&nbsp;({props.data.email})</>}
      <span
        style={{
          alignSelf: 'center',
          marginLeft: 'auto',
        }}
      >
        {format_registration_method(props.data.registration_method)}
      </span>
    </div>
  </components.Option>
);

const format_registration_method = (registration_method) => {
  return (
    <small>
      <style>
        {`
          #registration-method-tooltip {
            z-index: 9999;
          }
        `}
      </style>
      <Tip label={registration_method} id="registration-method-tooltip">
        <i className="fa fa-key" />
      </Tip>
    </small>
  );
};

export const UserListOption: FunctionComponent<any> = (props) => (
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
            {translate('Email')}: {props.data.email}
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

export const UserGroup: FunctionComponent<{
  customerUuid;
  editUser;
  disabled;
}> = ({ customerUuid, editUser, disabled }) =>
  editUser ? (
    <Form.Group>
      <p>
        <strong>{translate('User')}</strong>:{' '}
        {editUser.user_full_name || editUser.user_username}
      </p>
    </Form.Group>
  ) : (
    <Form.Group>
      <Form.Label>{translate('User')}</Form.Label>
      <AsyncSelectField
        name="user"
        isDisabled={disabled}
        required={true}
        isClearable={true}
        components={{ Option: UserListOption }}
        placeholder={translate('Select user...')}
        loadOptions={(query, prevOptions, page) =>
          customerUsersAutocomplete(
            customerUuid,
            { full_name: query },
            prevOptions,
            page,
          )
        }
        getOptionValue={(option) => option.full_name || option.username}
        getOptionLabel={(option) => option.full_name || option.username}
      />
    </Form.Group>
  );
