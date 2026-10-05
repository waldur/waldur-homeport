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
  side?: 'top' | 'right' | 'bottom' | 'left';
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
      side={props.side}
      disabled={props.disabled}
      size={props.size}
    />
  );
};
