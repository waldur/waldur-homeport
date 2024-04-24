import { FunctionComponent } from 'react';
import { components } from 'react-select';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

export const UserListOptionInline: FunctionComponent<any> = (props) => (
  <components.Option {...props}>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      {props.data.full_name}
      {props.data.email && <>&nbsp;({props.data.email})</>}
      <span
        style={{
          marginLeft: '5px',
        }}
      >
        {format_inactive_users(props.data.is_active)}
      </span>
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
          #inactive-user-tooltip {
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

const format_inactive_users = (is_active) => {
  return (
    <small>
      <style>
        {`
          #inactive-user-tooltip {
            z-index: 9999;
          }
        `}
      </style>
      {is_active === false && (
        <Tip label={translate('Inactive')} id="inactive-user-tooltip">
          <i className="fa fa-ban" />
        </Tip>
      )}
    </small>
  );
};
