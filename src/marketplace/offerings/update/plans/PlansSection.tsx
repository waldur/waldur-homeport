import { CheckFat, Warning } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Card } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { getOfferingPlans } from '@waldur/marketplace/common/api';
import { hidePlanAddButton } from '@waldur/marketplace/common/registry';
import { Plan } from '@waldur/marketplace/types';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { getUser } from '@waldur/workspace/selectors';

import { RefreshButton } from '../components/RefreshButton';
import { OfferingSectionProps } from '../types';

import { AddPlanButton } from './AddPlanButton';
import { PlansTable } from './PlansTable';

export const PlansSection: FC<OfferingSectionProps> = (props) => {
  const user = useSelector(getUser);
  const {
    data: plans,
    refetch,
    isRefetching,
  } = useQuery<{}, {}, Plan[]>(
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
    <Card id="plans">
      <div className="border-2 border-bottom card-header">
        <div className="card-title h5">
          {plans.length === 0 ? (
            <Warning size={18} weight="fill" className="text-danger me-3" />
          ) : (
            <CheckFat size={18} weight="fill" className="text-success me-3" />
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
              <AddPlanButton refetch={refetch} offering={props.offering} />
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
          <PlansTable
            plans={plans}
            offering={props.offering}
            refetch={refetch}
            user={user}
          />
        )}
      </Card.Body>
    </Card>
  );
};
