import { FunctionComponent } from 'react';
import { useBoolean } from 'react-use';

import { Resource } from '@waldur/marketplace/resources/types';
import { ResourceActionComponent } from '@waldur/resource/actions/ResourceActionComponent';

import { StaffActions, ProviderActionsList } from '../actions/ActionsList';

interface ProviderResourceActionsProps {
  resource: Resource;
  refetch(): void;
}

export const ProviderResourceActions: FunctionComponent<
  ProviderResourceActionsProps
> = ({ resource, refetch }) => {
  const [open, onToggle] = useBoolean(false);
  return (
    <ResourceActionComponent
      open={open}
      onToggle={onToggle}
      providerResourceActions={ProviderActionsList}
      staffActions={StaffActions}
      resource={resource}
      refetch={refetch}
    />
  );
};
