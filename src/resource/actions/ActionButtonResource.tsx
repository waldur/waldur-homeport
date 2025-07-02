import React from 'react';
import { useAsyncFn, useBoolean } from 'react-use';
import { marketplaceResourcesRetrieve } from 'waldur-js-client';

import { get } from '@waldur/core/api';
import {
  CustomerResourceActions,
  StaffActions,
} from '@waldur/marketplace/resources/actions/ActionsList';

import { getActions } from './registry';
import { ResourceActionComponent } from './ResourceActionComponent';
import { ActionItemType } from './types';

interface ActionButtonResourceProps {
  url: string;
  disabled?: boolean;
  refetch?(): void;
  extraActions?: ActionItemType[];
}

async function loadData(url: string) {
  const resource = await get<{
    resource_type;
    marketplace_resource_uuid;
  }>(url);
  const resourceTypeActions = getActions(resource.resource_type);
  let staffActions = [];
  let customerResourceActions = [];
  let marketplaceResource;
  if (resource.marketplace_resource_uuid) {
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
  const { url } = props;

  const [{ loading, error, value }, getActions] = useAsyncFn(
    () => loadData(url),
    [url],
  );

  const [open, onToggle] = useBoolean(false);

  const loadActionsIfOpen = React.useCallback(() => {
    open && getActions();
  }, [open, getActions]);

  React.useEffect(loadActionsIfOpen, [open, loadActionsIfOpen]);

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
