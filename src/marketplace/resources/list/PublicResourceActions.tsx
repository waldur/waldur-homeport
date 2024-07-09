import { FunctionComponent } from 'react';

import { EditResourceEndDateByProviderAction } from '@waldur/marketplace/resources/actions/EditResourceEndDateByProviderAction';
import { EditResourceEndDateByStaffAction } from '@waldur/marketplace/resources/actions/EditResourceEndDateByStaffAction';
import { SetBackendIdAction } from '@waldur/marketplace/resources/SetBackendIdAction';
import { Resource } from '@waldur/marketplace/resources/types';
import { CreateRobotAccountAction } from '@waldur/marketplace/robot-accounts/CreateRobotAccountAction';
import { ActionsDropdownComponent } from '@waldur/table/ActionsDropdown';

import { MoveResourceAction } from '../actions/MoveResourceAction';
import { TerminateAction } from '../terminate/TerminateAction';

import { ReportUsageAction } from './ReportUsageAction';
import { ShowUsageAction } from './ShowUsageAction';

const ActionsList = [
  ShowUsageAction,
  ReportUsageAction,
  SetBackendIdAction,
  MoveResourceAction,
  EditResourceEndDateByProviderAction,
  EditResourceEndDateByStaffAction,
  CreateRobotAccountAction,
  TerminateAction,
];

interface PublicResourceActionsProps {
  resource: Resource;
  refetch(): void;
}

export const PublicResourceActions: FunctionComponent<
  PublicResourceActionsProps
> = ({ resource, refetch }) => {
  return (
    <ActionsDropdownComponent data-cy="public-resources-list-actions-dropdown-btn">
      {ActionsList.map((ActionComponent: any, index: number) => (
        <ActionComponent
          key={index}
          resource={{
            ...resource,
            marketplace_resource_uuid: resource.uuid,
          }}
          refetch={refetch}
        />
      ))}
    </ActionsDropdownComponent>
  );
};
