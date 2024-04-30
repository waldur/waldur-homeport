import { FC } from 'react';
import { OptionProps, components } from 'react-select';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

type UserListOptionInlineProps = OptionProps<{
  full_name: string;
  email: string;
  is_active: boolean;
  registration_method: string;
}>;

export const UserListOptionInline: FC<UserListOptionInlineProps> = (props) => (
  <components.Option {...props}>
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

    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      {props.data.full_name}
      {props.data.email && <>&nbsp;({props.data.email})</>}
      <span
        style={{
          marginLeft: '5px',
        }}
      >
        {props.data.is_active === false && (
          <Tip label={translate('Inactive')} id="inactive-user-tooltip">
            <i className="fa fa-ban" />
          </Tip>
        )}
      </span>
      <span
        style={{
          alignSelf: 'center',
          marginLeft: 'auto',
        }}
      >
        <small>
          <Tip
            label={props.data.registration_method}
            id="registration-method-tooltip"
          >
            <i className="fa fa-key" />
          </Tip>
        </small>
      </span>
    </div>
  </components.Option>
);
