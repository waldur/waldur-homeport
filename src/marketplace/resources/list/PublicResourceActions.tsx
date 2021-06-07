import { DropdownButton } from 'react-bootstrap';
import { useBoolean } from 'react-use';

import { translate } from '@waldur/i18n';
import { EditResourceEndDateAction } from '@waldur/marketplace/resources/actions/EditResourceEndDateAction';
import { SetBackendIdAction } from '@waldur/marketplace/resources/SetBackendIdAction';
import { Resource } from '@waldur/marketplace/resources/types';

import { MoveResourceAction } from '../actions/MoveResourceAction';

import { ReportUsageAction } from './ReportUsageAction';
import { ShowUsageAction } from './ShowUsageAction';

const ActionsList = [
  ShowUsageAction,
  ReportUsageAction,
  SetBackendIdAction,
  MoveResourceAction,
  EditResourceEndDateAction,
];

interface PublicResourceActionsProps {
  resource: Resource;
  refreshList(): void;
}

export const PublicResourceActions = ({
  resource,
  refreshList,
}: PublicResourceActionsProps) => {
  const [open, onToggle] = useBoolean(false);
  return (
    <DropdownButton
      title={translate('Actions')}
      id="public-resources-list-actions-dropdown-btn"
      className="dropdown-btn"
      onToggle={onToggle}
      open={open}
      pullRight
    >
      {ActionsList.map((ActionComponent: any, index: number) => (
        <ActionComponent
          key={index}
          resource={{
            ...resource,
            marketplace_resource_uuid: resource.uuid,
          }}
          refreshList={refreshList}
        />
      ))}
    </DropdownButton>
  );
};
