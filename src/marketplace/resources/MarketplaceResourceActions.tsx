import { useBoolean } from 'react-use';

import { AcceptAction } from '@waldur/booking/AcceptAction';
import { CancelAction } from '@waldur/booking/CancelAction';
import { RejectAction } from '@waldur/booking/RejectAction';
import { ChangePlanAction } from '@waldur/marketplace/resources/change-plan/ChangePlanAction';
import { SubmitReportAction } from '@waldur/marketplace/resources/report/SubmitReportAction';
import { EditAction } from '@waldur/openstack/openstack-tenant/actions/EditAction';
import { TerminateTenantAction } from '@waldur/openstack/openstack-tenant/actions/TerminateTenantAction';
import { ResourceActionComponent } from '@waldur/resource/actions/ResourceActionComponent';

const ActionsList = [
  EditAction,
  AcceptAction,
  RejectAction,
  ChangePlanAction,
  CancelAction,
  SubmitReportAction,
  TerminateTenantAction,
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
