import Axios from 'axios';
import React from 'react';
import { useAsyncFn, useBoolean } from 'react-use';

import './ActionButtonResource.scss';
import { ActionRegistry } from './registry';
import { ResourceActionComponent } from './ResourceActionComponent';

interface ActionButtonResourceProps {
  url: string;
  disabled?: boolean;
  controller?: any;
}

async function loadData(url: string) {
  const response = await Axios.get(url);
  const resource = response.data;
  const actions = ActionRegistry.getActions(resource.resource_type);
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

  React.useEffect(loadActionsIfOpen, [open]);

  return (
    <ResourceActionComponent
      open={open}
      disabled={props.disabled}
      loading={loading}
      error={error}
      actions={value?.actions}
      onToggle={onToggle}
      resource={value?.resource}
    />
  );
};
