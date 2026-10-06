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
  side?: 'top' | 'right' | 'bottom' | 'left';
  disabled?: boolean;
  size?: 'sm' | 'lg';
  /** Actions that make no sense where the menu is shown. */
  excludeActions?: ActionItemType[];
}

export const ProviderResourceActions: FunctionComponent<
  ProviderResourceActionsProps
> = ({ resource, refetch, labeled, side, disabled, size, excludeActions }) => {
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
      side={side}
      disabled={disabled}
      size={size}
    />
  );
};
