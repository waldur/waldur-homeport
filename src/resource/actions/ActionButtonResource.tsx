import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { useBoolean } from 'react-use';
import { marketplaceResourcesRetrieve } from 'waldur-js-client';

import { get } from '@/core/api';
import {
  CustomerResourceActions,
  StaffActions,
} from '@/marketplace/resources/actions/ActionsList';

import { getActions } from './registry';
import { ResourceActionComponent } from './ResourceActionComponent';
import { ActionItemType } from './types';

interface ActionButtonResourceProps {
  url: string;
  disabled?: boolean;
  refetch?(): void;
  extraActions?: ActionItemType[];
  /**
   * When true, only the resource-type-specific actions are shown — the
   * marketplace-resource staff/customer actions (Change plan, Set slug,
   * Unlink, Terminate, …) are suppressed even if the resource has a
   * `marketplace_resource_uuid`. Use this for nested resources whose row
   * actions should never include marketplace-wide operations: routers,
   * networks, subnets, ports.
   */
  nestedResource?: boolean;
}

async function loadData(url: string, nestedResource: boolean) {
  const resource = await get<{
    resource_type;
    marketplace_resource_uuid;
  }>(url);
  const resourceTypeActions = getActions(resource.resource_type);
  let staffActions = [];
  let customerResourceActions = [];
  let marketplaceResource;
  if (!nestedResource && resource.marketplace_resource_uuid) {
    staffActions = StaffActions;
    customerResourceActions = CustomerResourceActions;
    marketplaceResource = await marketplaceResourcesRetrieve({
      path: { uuid: resource.marketplace_resource_uuid },
    }).then((r) => r.data);
  }
  return {
    resource,
    marketplaceResource,
    staffActions,
    customerResourceActions,
    resourceTypeActions,
  };
}

export const ActionButtonResource: React.FC<ActionButtonResourceProps> = (
  props,
) => {
  const { url, nestedResource = false } = props;

  const [open, onToggle] = useBoolean(false);

  const {
    isLoading: loading,
    error,
    data: value,
  } = useQuery({
    queryKey: ['ResourceActions', url, nestedResource],
    queryFn: () => loadData(url, nestedResource),
    enabled: open,
  });

  return (
    <ResourceActionComponent
      {...value}
      extraActions={props.extraActions}
      open={open}
      disabled={props.disabled}
      loading={loading}
      error={error}
      onToggle={onToggle}
      refetch={props.refetch}
    />
  );
};
