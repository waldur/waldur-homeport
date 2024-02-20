import { FunctionComponent } from 'react';
import { components } from 'react-select';

import { translate } from '@waldur/i18n';

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
