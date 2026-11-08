import { KeyIcon, ProhibitIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { OptionProps } from 'react-select';

import { SelectOption, Tooltip } from 'waldur-ui';

import { Image } from '@/core/Image';
import { ImagePlaceholder } from '@/core/ImagePlaceholder';
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
  <SelectOption {...props}>
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

    <div className="flex items-center gap-2.5">
      {props.data.image ? (
        <Image src={props.data.image} size={size} isContain circle />
      ) : (
        <ImagePlaceholder width={`${size}px`} height={`${size}px`} circle>
          {props.data.full_name[0]}
        </ImagePlaceholder>
      )}

      <div className="flex-1 flex flex-col">
        <span>
          {props.data.full_name}{' '}
          <span className="text-quaternary">@{props.data.username}</span>
        </span>
        {props.data.email && (
          <small className="text-quaternary">{props.data.email}</small>
        )}
      </div>

      <div className="flex items-center gap-[5px]">
        {props.data.is_active === false && (
          <Tooltip label={translate('Inactive')}>
            <ProhibitIcon weight="bold" />
          </Tooltip>
        )}
        <Tooltip label={props.data.registration_method}>
          <KeyIcon weight="bold" />
        </Tooltip>
      </div>
    </div>
  </SelectOption>
);
