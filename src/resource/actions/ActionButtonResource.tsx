import Axios from 'axios';
import React from 'react';
import { useAsyncFn, useBoolean } from 'react-use';

import { ActionRegistry } from './registry';
import { ResourceActionComponent } from './ResourceActionComponent';
import { getResourceCommonActions } from './utils';

interface ActionButtonResourceProps {
  url: string;
  disabled?: boolean;
  refetch?(): void;
}

async function loadData(url: string) {
  const response = await Axios.get(url);
  const resource = response.data;
  const actions = ActionRegistry.getActions(resource.resource_type);
  const actionsList = getResourceCommonActions();
  const extraActions = actions.filter(
    (action) => !actionsList.includes(action as any),
  );
  return { resource, actions: actionsList.concat(extraActions as any) };
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
