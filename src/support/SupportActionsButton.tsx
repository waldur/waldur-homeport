import { FunctionComponent } from 'react';
import { useBoolean } from 'react-use';

import { ChangePlanAction } from '@waldur/marketplace/resources/change-plan/ChangePlanAction';
import { SubmitReportAction } from '@waldur/marketplace/resources/report/SubmitReportAction';
import { SetBackendIdAction } from '@waldur/marketplace/resources/SetBackendIdAction';
import { TerminateAction } from '@waldur/marketplace/resources/terminate/TerminateAction';
import { Resource } from '@waldur/marketplace/resources/types';
import { ResourceShowUsageButton } from '@waldur/marketplace/resources/usage/ResourceShowUsageButton';
import { ResourceActionComponent } from '@waldur/resource/actions/ResourceActionComponent';

import { EditAction } from './EditAction';

interface SupportActionsButtonProps {
  resource: Resource;
  reInitResource?(): void;
}

export const SupportActionsButton: FunctionComponent<SupportActionsButtonProps> = (
  props,
) => {
  const [open, onToggle] = useBoolean(false);
  const ActionsList = [
    EditAction,
    SubmitReportAction,
    ChangePlanAction,
    SetBackendIdAction,
    TerminateAction,
    () => (
      <ResourceShowUsageButton
        resource={props.resource}
        offeringUuid={props.resource.offering_uuid}
        resourceUuid={props.resource.uuid}
      />
    ),
  ];
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
