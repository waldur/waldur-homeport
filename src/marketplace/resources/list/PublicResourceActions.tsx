import { FunctionComponent } from 'enzyme';
import { DropdownButton } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { EditResourceEndDateByProviderAction } from '@waldur/marketplace/resources/actions/EditResourceEndDateByProviderAction';
import { EditResourceEndDateByStaffAction } from '@waldur/marketplace/resources/actions/EditResourceEndDateByStaffAction';
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
  EditResourceEndDateByProviderAction,
  EditResourceEndDateByStaffAction,
];

interface PublicResourceActionsProps {
  resource: Resource;
  refreshList(): void;
}

export const PublicResourceActions: FunctionComponent<PublicResourceActionsProps> =
  ({ resource, refreshList }) => {
    return (
      <DropdownButton
        title={translate('Actions')}
        variant="secondary"
        size="sm"
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
