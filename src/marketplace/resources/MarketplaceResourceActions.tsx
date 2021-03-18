import { useBoolean } from 'react-use';

import { AcceptAction } from '@waldur/booking/AcceptAction';
import { CancelAction } from '@waldur/booking/CancelAction';
import { RejectAction } from '@waldur/booking/RejectAction';
import { ChangePlanAction } from '@waldur/marketplace/resources/change-plan/ChangePlanAction';
import { SubmitReportAction } from '@waldur/marketplace/resources/report/SubmitReportAction';
import { TerminateAction } from '@waldur/marketplace/resources/terminate/TerminateAction';
import { EditAction } from '@waldur/openstack/openstack-tenant/actions/EditAction';
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
