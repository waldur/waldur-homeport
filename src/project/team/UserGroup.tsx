import { FunctionComponent } from 'react';
import { ControlLabel, FormControl, FormGroup } from 'react-bootstrap';
import { components } from 'react-select';

import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { reactSelectMenuPortaling } from '@waldur/form/utils';
import { translate } from '@waldur/i18n';
import { usersAutocomplete } from '@waldur/project/team/api';

export const UserListOptionInline: FunctionComponent<any> = (props) => (
  <components.Option {...props}>
    <div>
      {props.data.full_name}
      {props.data.email && <>&nbsp;({props.data.email})</>}
    </div>
  </components.Option>
);

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
  users;
  disabled;
}> = ({ customerUuid, editUser, users, disabled }) =>
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
      <AsyncSelectField
        name="user"
        isDisabled={disabled}
        required={true}
        isClearable={true}
        components={{ Option: UserListOption }}
        placeholder={translate('Select user...')}
        loadOptions={(query, prevOptions, page) =>
          usersAutocomplete(
            customerUuid,
            { full_name: query },
            prevOptions,
            page,
          )
        }
        getOptionValue={(option) => option.full_name || option.username}
        getOptionLabel={(option) => option.full_name || option.username}
        {...reactSelectMenuPortaling()}
      />
    </FormGroup>
  ) : (
    <p className="text-danger">{translate('There are no available users.')}</p>
  );
