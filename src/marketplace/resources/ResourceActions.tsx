import { useMemo } from 'react';
import { Dropdown } from 'react-bootstrap';

import { EditResourceEndDateAction } from '@waldur/marketplace/resources/actions/EditResourceEndDateAction';
import { MoveResourceAction } from '@waldur/marketplace/resources/actions/MoveResourceAction';
import { ChangePlanAction } from '@waldur/marketplace/resources/change-plan/ChangePlanAction';
import { SubmitReportAction } from '@waldur/marketplace/resources/report/SubmitReportAction';
import { SetBackendIdAction } from '@waldur/marketplace/resources/SetBackendIdAction';
import { ActionRegistry } from '@waldur/resource/actions/registry';

import { EditAction } from './actions/EditAction';

const ActionsList = [
  EditAction,
  MoveResourceAction,
  SubmitReportAction,
  ChangePlanAction,
  SetBackendIdAction,
  EditResourceEndDateAction,
];

export const ResourceActions = ({ resource, scope, refetch }) => {
  const extraActions = useMemo(() => {
    const quickActions = ActionRegistry.getQuickActions(resource.resource_type);
    return ActionRegistry.getActions(resource.resource_type).filter(
      (action) =>
        // @ts-ignore
        !quickActions.includes(action) && !ActionsList.includes(action),
    );
  }, [resource]);
  return (
    <Dropdown>
      <Dropdown.Toggle
        variant="link"
        bsPrefix="btn-icon btn-bg-light btn-sm btn-active-color-primary"
      >
        <i className="fa fa-ellipsis-h"></i>
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {ActionsList.map((ActionComponent, index) => (
          <ActionComponent key={index} resource={resource} refetch={refetch} />
        ))}
        {extraActions.map((ActionComponent, index) => (
          <ActionComponent key={index} resource={scope} refetch={refetch} />
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};
