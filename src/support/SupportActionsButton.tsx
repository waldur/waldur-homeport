import { FunctionComponent } from 'react';
import { useBoolean } from 'react-use';

import { ChangePlanAction } from '@waldur/marketplace/resources/change-plan/ChangePlanAction';
import { SubmitReportAction } from '@waldur/marketplace/resources/report/SubmitReportAction';
import { SetBackendIdAction } from '@waldur/marketplace/resources/SetBackendIdAction';
import { TerminateAction } from '@waldur/marketplace/resources/terminate/TerminateAction';
import { Resource } from '@waldur/marketplace/resources/types';
import { ResourceActionComponent } from '@waldur/resource/actions/ResourceActionComponent';

import { EditAction } from './EditAction';

const ActionsList = [
  EditAction,
  SubmitReportAction,
  ChangePlanAction,
  SetBackendIdAction,
  TerminateAction,
];

interface SupportActionsButtonProps {
  resource: Resource;
  reInitResource?(): void;
}

export const SupportActionsButton: FunctionComponent<SupportActionsButtonProps> = (
  props,
) => {
  const [open, onToggle] = useBoolean(false);

  return (
    <ResourceActionComponent
      open={open}
      onToggle={onToggle}
      actions={ActionsList}
      resource={props.resource}
      reInitResource={props.reInitResource}
    />
  );
};
// use this example
