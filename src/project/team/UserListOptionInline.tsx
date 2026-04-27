import { KeyIcon, ProhibitIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { OptionProps, components } from 'react-select';

import { Image } from '@/core/Image';
import { ImagePlaceholder } from '@/core/ImagePlaceholder';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';

type UserListOptionInlineProps = OptionProps<{
  full_name: string;
  email: string;
  is_active: boolean;
  registration_method: string;
  username: string;
  image?: string;
}>;

const size = 32;

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

    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {props.data.image ? (
        <Image src={props.data.image} size={size} isContain circle />
      ) : (
        <ImagePlaceholder width={`${size}px`} height={`${size}px`} circle>
          {props.data.full_name[0]}
        </ImagePlaceholder>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <span>
          {props.data.full_name}{' '}
          <span style={{ color: '#666' }}>@{props.data.username}</span>
        </span>
        {props.data.email && (
          <small style={{ color: '#666' }}>{props.data.email}</small>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        {props.data.is_active === false && (
          <Tip label={translate('Inactive')} id="inactive-user-tooltip">
            <ProhibitIcon weight="bold" />
          </Tip>
        )}
        <Tip
          label={props.data.registration_method}
          id="registration-method-tooltip"
        >
          <KeyIcon weight="bold" />
        </Tip>
      </div>
    </div>
  </components.Option>
);
