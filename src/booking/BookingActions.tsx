import { useBoolean } from 'react-use';

import { ChangePlanAction } from '@waldur/marketplace/resources/change-plan/ChangePlanAction';
import { SubmitReportAction } from '@waldur/marketplace/resources/report/SubmitReportAction';
import { EditAction } from '@waldur/openstack/openstack-tenant/actions/EditAction';
import { TerminateTenantAction } from '@waldur/openstack/openstack-tenant/actions/TerminateTenantAction';
import { ResourceActionComponent } from '@waldur/resource/actions/ResourceActionComponent';

import { AcceptAction } from './AcceptAction';
import { CancelAction } from './CancelAction';
import { RejectAction } from './RejectAction';

const ActionsList = [
  EditAction,
  AcceptAction,
  RejectAction,
  ChangePlanAction,
  CancelAction,
  SubmitReportAction,
  TerminateTenantAction,
];

export const BookingActions = ({ resource, reInitResource }) => {
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
