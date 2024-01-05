import { useQuery } from '@tanstack/react-query';
import { Card, Table } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { getOfferingPlans } from '@waldur/marketplace/common/api';
import { hidePlanAddButton } from '@waldur/marketplace/common/registry';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { getUser } from '@waldur/workspace/selectors';

import { RefreshButton } from '../components/RefreshButton';

import { AddPlanButton } from './AddPlanButton';
import { PlanActions } from './PlanActions';

export const PlansSection = (props) => {
  const user = useSelector(getUser);
  const {
    data: plans,
    refetch,
    isRefetching,
  } = useQuery(
    ['OfferingPlans', props.offering.uuid],
    () => (props.offering ? getOfferingPlans(props.offering.uuid) : []),
    {
      initialData: props.offering.plans,
      enabled: false,
    },
  );

  if (!plans) {
    return null;
  }

  return (
    <Card className="mb-10" id="plans">
      <div className="border-2 border-bottom card-header">
        <div className="card-title h5">
          {plans.length === 0 ? (
            <i className="fa fa-warning text-danger me-3" />
          ) : (
            <i className="fa fa-check text-success me-3" />
          )}
          <span className="me-2">{translate('Accounting plans')}</span>
          <RefreshButton refetch={refetch} loading={isRefetching} />
        </div>
        {!hidePlanAddButton(props.offering.type, plans) &&
          hasPermission(user, {
            permission: PermissionEnum.CREATE_OFFERING_PLAN,
            customerId: props.offering.customer_uuid,
          }) && (
            <div className="card-toolbar">
              <AddPlanButton {...props} />
            </div>
          )}
      </div>
      <Card.Body>
        {plans.length === 0 ? (
          <div className="justify-content-center row">
            <div className="col-sm-4">
              <p className="text-center">
                {translate("Offering doesn't have plans.")}
              </p>
            </div>
          </div>
        ) : (
          <Table bordered={true} hover={true} responsive={true}>
            <tbody>
              {plans.map((plan, planIndex) => (
                <tr key={planIndex}>
                  <td className="col-md-3">{plan.name}</td>
                  <td className="col-md-3">
                    {plan.archived
                      ? translate('Archived')
                      : translate('Active')}
                  </td>
                  <td className="row-actions">
                    <PlanActions
                      offering={props.offering}
                      plan={plan}
                      refetch={refetch}
                      user={user}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
};
