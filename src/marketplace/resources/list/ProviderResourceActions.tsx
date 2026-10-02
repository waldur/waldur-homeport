import { FunctionComponent, useMemo } from 'react';
import { useBoolean } from 'react-use';
import { Resource } from 'waldur-js-client';

import { ResourceActionComponent } from '@/resource/actions/ResourceActionComponent';
import { ActionItemType } from '@/resource/actions/types';

import { StaffActions, ProviderActionsList } from '../actions/ActionsList';

interface ProviderResourceActionsProps {
  resource: Resource;
  refetch(): void;
  labeled?: boolean;
  drop?: 'up' | 'down' | 'start' | 'end';
  disabled?: boolean;
  size?: 'sm' | 'lg';
  /** Actions that make no sense where the menu is shown. */
  excludeActions?: ActionItemType[];
}

export const ProviderResourceActions: FunctionComponent<
  ProviderResourceActionsProps
> = ({ resource, refetch, labeled, drop, disabled, size, excludeActions }) => {
  const [open, onToggle] = useBoolean(false);
  const providerActions = useMemo(
    () =>
      excludeActions?.length
        ? ProviderActionsList.filter(
            (action) => !excludeActions.includes(action),
          )
        : ProviderActionsList,
    [excludeActions],
  );
  return (
    <ResourceActionComponent
      open={open}
      onToggle={onToggle}
      providerResourceActions={providerActions}
      staffActions={StaffActions}
      resource={resource}
      refetch={refetch}
      labeled={labeled}
      drop={drop}
      disabled={disabled}
      size={size}
    />
  );
};
