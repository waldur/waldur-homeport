import { FunctionComponent } from 'react';
import { useBoolean } from 'react-use';
import { Resource } from 'waldur-js-client';

import { ResourceActionComponent } from '@/resource/actions/ResourceActionComponent';

import {
  CustomerResourceActions,
  ProviderActionsList,
  StaffActions,
} from './ActionsList';

interface ResourceActionsButtonProps {
  resource: Resource;
  refetch?(): void;
  labeled?: boolean;
  drop?: 'up' | 'down' | 'start' | 'end';
  disabled?: boolean;
  size?: 'sm' | 'lg';
}

export const ResourceActionsButton: FunctionComponent<
  ResourceActionsButtonProps
> = (props) => {
  const [open, onToggle] = useBoolean(false);

  return (
    <ResourceActionComponent
      open={open}
      onToggle={onToggle}
      customerResourceActions={CustomerResourceActions}
      providerResourceActions={ProviderActionsList}
      staffActions={StaffActions}
      resource={props.resource}
      refetch={props.refetch}
      labeled={props.labeled}
      drop={props.drop}
      disabled={props.disabled}
      size={props.size}
    />
  );
};
