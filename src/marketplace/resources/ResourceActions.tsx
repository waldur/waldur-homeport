import { FC, useMemo } from 'react';
import { DropDirection } from 'react-bootstrap/esm/DropdownContext';
import { useBoolean } from 'react-use';

import { ModalActionsRouter } from '@waldur/marketplace/resources/actions/ModalActionsRouter';
import { ResourceActionsButton as BaseResourceActionsButton } from '@waldur/marketplace/resources/actions/ResourceActionsButton';
import { getActions } from '@waldur/resource/actions/registry';
import { ResourceActionComponent } from '@waldur/resource/actions/ResourceActionComponent';

import {
  ActionsList,
  CustomerResourceActions,
  ProviderActionsList,
  StaffActions,
} from './actions/ActionsList';
import { ActionsLists } from './actions/ActionsLists';

interface ResourceActionsProps {
  resource;
  scope;
  refetch;
  labeled?: boolean;
  drop?: DropDirection;
  disabled?: boolean;
  size?: 'sm' | 'lg';
}

export const ResourceActions: FC<ResourceActionsProps> = ({
  resource,
  scope,
  refetch,
  drop,
  labeled = false,
  disabled,
  size,
}) => {
  const [open, onToggle] = useBoolean(false);
  const extraActions = useMemo(() => {
    return getActions(resource.resource_type).filter(
      (action) => !ActionsList.includes(action),
    );
  }, [resource]);
  if (!scope) {
    return (
      <BaseResourceActionsButton
        resource={
          {
            ...resource,
            marketplace_resource_uuid: resource.uuid,
          } as any
        }
        refetch={refetch}
        labeled
        drop={drop}
        disabled={disabled}
        size={size}
      />
    );
  }

  if (ActionsLists[resource.offering_type]) {
    return (
      <ModalActionsRouter
        offering_type={resource.offering_type}
        url={resource.scope}
        name={resource.name}
        refetch={refetch}
        labeled={labeled}
        drop={drop}
        disabled={disabled}
        size={size}
      />
    );
  }
  return (
    <ResourceActionComponent
      open={open}
      onToggle={onToggle}
      customerResourceActions={CustomerResourceActions}
      staffActions={StaffActions}
      providerResourceActions={ProviderActionsList}
      extraActions={extraActions}
      resource={resource}
      scope={scope}
      refetch={refetch}
      labeled={labeled}
      drop={drop}
      disabled={disabled}
      size={size}
    />
  );
};
