import Axios from 'axios';
import React from 'react';
import { useAsyncFn, useBoolean } from 'react-use';

import { ActionsList } from '@waldur/marketplace/resources/actions/ActionsList';

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
  let actions = ActionRegistry.getActions(resource.resource_type);
  if (resource.marketplace_resource_uuid) {
    const extraActions = actions.filter(
      (action) => !ActionsList.includes(action as any),
    );
    actions = ActionsList.concat(extraActions as any);
  }
  return { resource, actions };
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
      open={open}
      disabled={props.disabled}
      loading={loading}
      error={error}
      actions={value?.actions}
      onToggle={onToggle}
      resource={value?.resource}
      refetch={props.refetch}
    />
  );
};
