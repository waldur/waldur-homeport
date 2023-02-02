import { useMemo } from 'react';
import { Dropdown } from 'react-bootstrap';

import { ActionRegistry } from '@waldur/resource/actions/registry';
import { getResourceCommonActions } from '@waldur/resource/actions/utils';

import { ChangeLimitsAction } from './change-limits/ChangeLimitsAction';

export const ResourceActions = ({ resource, scope, refetch }) => {
  const actionsList = useMemo(
    () =>
      getResourceCommonActions().filter(
        (action) => action !== ChangeLimitsAction,
      ),
    [],
  );
  const extraActions = useMemo(() => {
    // Don't list ChangeLimitsAction because we already added it inside the Quick Actions.
    const quickActions = ActionRegistry.getQuickActions(resource.resource_type);
    return ActionRegistry.getActions(resource.resource_type).filter(
      (action) =>
        // @ts-ignore
        !quickActions.includes(action) && !actionsList.includes(action),
    );
  }, [resource, actionsList]);
  return (
    <Dropdown>
      <Dropdown.Toggle
        variant="link"
        bsPrefix="btn-icon btn-bg-light btn-sm btn-active-color-primary"
      >
        <i className="fa fa-ellipsis-h"></i>
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {actionsList.map((ActionComponent, index) => (
          <ActionComponent key={index} resource={resource} refetch={refetch} />
        ))}
        {extraActions.map((ActionComponent, index) => (
          <ActionComponent key={index} resource={scope} refetch={refetch} />
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};
