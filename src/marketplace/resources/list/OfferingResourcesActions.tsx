import { FunctionComponent } from 'react';
import { useBoolean } from 'react-use';

// import { ChangePlanAction } from '@waldur/marketplace/resources/change-plan/ChangePlanAction';
// import { SubmitReportAction } from '@ waldur/marketplace/resources/report/SubmitReportAction';
import { SetBackendIdAction } from '@waldur/marketplace/resources/SetBackendIdAction';
// import { TerminateAction } from '@waldur/marketplace/resources/terminate/TerminateAction';
import { Resource } from '@waldur/marketplace/resources/types';
import { ResourcesShowUsageButton } from '@waldur/marketplace/resources/usage/ResourceShowUsageButton';
import { ResourceActionComponent } from '@waldur/resource/actions/ResourceActionComponent';

// action list
const ActionsList = [
  // SubmitReportAction,
  // ChangePlanAction,
  SetBackendIdAction,
  ResourcesShowUsageButton,
  // TerminateAction,
];

interface SupportActionsButtonProps {
  row: Resource;
}

export const OfferingResourcesActions: FunctionComponent<SupportActionsButtonProps> = (
  props,
) => {
  const [open, onToggle] = useBoolean(false);

  return (
    <ResourceActionComponent
      open={open}
      onToggle={onToggle}
      actions={ActionsList}
      resource={props.row}
    />
  );
};
// use this example
