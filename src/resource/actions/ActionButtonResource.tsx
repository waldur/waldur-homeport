import Axios from 'axios';
import React from 'react';
import { useAsyncFn, useBoolean } from 'react-use';

import { getResource } from '@waldur/marketplace/common/api';
import {
  CustomerResourceActions,
  StaffActions,
} from '@waldur/marketplace/resources/actions/ActionsList';

import { ActionRegistry } from './registry';
import { ResourceActionComponent } from './ResourceActionComponent';

interface ActionButtonResourceProps {
  url: string;
  disabled?: boolean;
  refetch?(): void;
}

async function loadData(url: string) {
  const response = await Axios.get(url);
  const resource = response.data;
  const resourceTypeActions = ActionRegistry.getActions(resource.resource_type);
  let staffActions = [];
  let customerResourceActions = [];
  let marketplaceResource;
  if (resource.marketplace_resource_uuid) {
    staffActions = StaffActions;
    customerResourceActions = CustomerResourceActions;
    marketplaceResource = await getResource(resource.marketplace_resource_uuid);
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
      open={open}
      disabled={props.disabled}
      loading={loading}
      error={error}
      onToggle={onToggle}
      refetch={props.refetch}
    />
  );
};
