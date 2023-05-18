import { FunctionComponent } from 'react';
import { useBoolean } from 'react-use';

import { EditResourceEndDateAction } from '@waldur/marketplace/resources/actions/EditResourceEndDateAction';
import { MoveResourceAction } from '@waldur/marketplace/resources/actions/MoveResourceAction';
import { ChangePlanAction } from '@waldur/marketplace/resources/change-plan/ChangePlanAction';
import { ShowReportAction } from '@waldur/marketplace/resources/report/ShowReportAction';
import { SubmitReportAction } from '@waldur/marketplace/resources/report/SubmitReportAction';
import { SetBackendIdAction } from '@waldur/marketplace/resources/SetBackendIdAction';
import { TerminateAction } from '@waldur/marketplace/resources/terminate/TerminateAction';
import { Resource } from '@waldur/marketplace/resources/types';
import { ResourceActionComponent } from '@waldur/resource/actions/ResourceActionComponent';

import { ChangeLimitsAction } from '../change-limits/ChangeLimitsAction';

import { EditAction } from './EditAction';

const ActionsList = [
  EditAction,
  MoveResourceAction,
  ShowReportAction,
  SubmitReportAction,
  ChangePlanAction,
  ChangeLimitsAction,
  SetBackendIdAction,
  TerminateAction,
  EditResourceEndDateAction,
];

interface ResourceActionsButtonProps {
  resource: Resource;
  refetch?(): void;
}

export const ResourceActionsButton: FunctionComponent<ResourceActionsButtonProps> =
  (props) => {
    const [open, onToggle] = useBoolean(false);

    return (
      <ResourceActionComponent
        open={open}
        onToggle={onToggle}
        actions={ActionsList}
        resource={props.resource}
        refetch={props.refetch}
      />
    );
  };
