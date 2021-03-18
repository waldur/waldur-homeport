import { useBoolean } from 'react-use';

import { AcceptAction } from '@waldur/marketplace/resources/AcceptAction';
import { CancelAction } from '@waldur/marketplace/resources/CancelAction';
import { ChangePlanAction } from '@waldur/marketplace/resources/change-plan/ChangePlanAction';
import { EditAction } from '@waldur/marketplace/resources/EditAction';
import { RejectAction } from '@waldur/marketplace/resources/RejectAction';
import { SubmitReportAction } from '@waldur/marketplace/resources/report/SubmitReportAction';
import { TerminateAction } from '@waldur/marketplace/resources/terminate/TerminateAction';
import { ResourceActionComponent } from '@waldur/resource/actions/ResourceActionComponent';

const ActionsList = [
  EditAction,
  AcceptAction,
  RejectAction,
  ChangePlanAction,
  CancelAction,
  SubmitReportAction,
  TerminateAction,
];

export const MarketplaceResourceActions = ({ resource, reInitResource }) => {
  const [open, onToggle] = useBoolean(false);

  return (
    <ResourceActionComponent
      open={open}
      onToggle={onToggle}
      actions={ActionsList}
      resource={resource}
      reInitResource={reInitResource}
    />
  );
};
