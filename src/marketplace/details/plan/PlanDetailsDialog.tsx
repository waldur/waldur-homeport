import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Query } from '@waldur/core/Query';
import { defaultCurrency } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { getResource, getOffering } from '@waldur/marketplace/common/api';
import { BillingPeriod } from '@waldur/marketplace/common/BillingPeriod';
import { getFormLimitParser } from '@waldur/marketplace/common/registry';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { connectAngularComponent } from '@waldur/store/connect';

import { PureDetailsTable } from './PlanDetailsTable';
import { combinePrices } from './utils';

interface PlanDetailsDialogProps {
  resolve: { resourceId: string };
}

async function loadData(resourceId: string) {
  const resource = await getResource(resourceId);
  const offering = await getOffering(resource.offering_uuid);
  const plan =
    resource.plan && offering.plans.find(item => item.url === resource.plan);
  const limitParser = getFormLimitParser(offering.type);
  return {
    offering,
    plan: plan && {
      ...plan,
      unit_price:
        typeof plan.unit_price === 'string'
          ? parseFloat(plan.unit_price)
          : plan.unit_price,
    },
    ...combinePrices(plan, limitParser(resource.limits), offering),
  };
}

const PlanDetailsDialog: React.FC<PlanDetailsDialogProps> = props => (
  <ModalDialog title={translate('Plan details')} footer={<CloseDialogButton />}>
    <Query loader={loadData} variables={props.resolve.resourceId}>
      {({ loading, data, error }) => {
        if (loading) {
          return <LoadingSpinner />;
        }
        if (error) {
          return <p>{translate('Unable to load plan details.')}</p>;
        }
        if (!data.plan) {
          return <p>{translate('Resource does not have plan.')}</p>;
        }
        return (
          <>
            <p>
              <strong>{translate('Plan name')}</strong>: {data.plan.name}
            </p>
            {data.plan.description && (
              <p>
                <strong>{translate('Plan description')}</strong>:{' '}
                {data.plan.description}
              </p>
            )}
            {data.plan.unit_price > 0 && (
              <>
                <p>
                  <strong>{translate('Plan price')}</strong>:{' '}
                  {defaultCurrency(data.plan.unit_price)}
                </p>
                <p>
                  <strong>{translate('Billing period')}</strong>:{' '}
                  <BillingPeriod unit={data.plan.unit} />
                </p>
              </>
            )}
            <PureDetailsTable
              {...data}
              formGroupClassName=""
              columnClassName=""
              viewMode={true}
            />
          </>
        );
      }}
    </Query>
  </ModalDialog>
);

export default connectAngularComponent(PlanDetailsDialog, ['resolve']);
