import { useMemo } from 'react';
import { Dropdown } from 'react-bootstrap';

import { ModalActionsRouter } from '@waldur/marketplace/resources/actions/ModalActionsRouter';
import {
  INSTANCE_TYPE,
  TENANT_TYPE,
  VOLUME_TYPE,
} from '@waldur/openstack/constants';
import { ActionRegistry } from '@waldur/resource/actions/registry';

import { ActionsList } from './actions/ActionsList';
import { ChangeLimitsAction } from './change-limits/ChangeLimitsAction';

const actionsList = ActionsList.filter(
  (action) => action !== ChangeLimitsAction,
);

export const ResourceActions = ({ resource, scope, refetch }) => {
  const extraActions = useMemo(() => {
    // Don't list ChangeLimitsAction because we already added it inside the Quick Actions.
    const quickActions = ActionRegistry.getQuickActions(resource.resource_type);
    return ActionRegistry.getActions(resource.resource_type).filter(
      (action) =>
        // @ts-ignore
        !quickActions.includes(action) && !actionsList.includes(action),
    );
  }, [resource]);
  if (
    [INSTANCE_TYPE, VOLUME_TYPE, TENANT_TYPE].includes(resource.offering_type)
  ) {
    return (
      <ModalActionsRouter
        offering_type={resource.offering_type}
        url={resource.scope}
        name={resource.name}
        refetch={refetch}
      />
    );
  }
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
          <ActionComponent
            key={index}
            resource={scope || resource}
            refetch={refetch}
          />
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};
