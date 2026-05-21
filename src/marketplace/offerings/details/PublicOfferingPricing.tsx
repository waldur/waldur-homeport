import { FC } from 'react';
import { Form } from 'react-final-form';
import { BasePublicPlan, PublicOfferingDetails } from 'waldur-js-client';

import { Panel } from '@/core/Panel';
import { useWrappedTabs } from '@/core/WrappedTabs';
import { translate } from '@/i18n';

import { ExportFullPriceList } from './ExportFullPriceList';
import { PublicOfferingPricingPlanItem } from './PublicOfferingPricingPlanItem';

import './PublicOfferingPricing.scss';

interface PublicOfferingPricingProps {
  offering: PublicOfferingDetails;
}

export const PublicOfferingPricing: FC<PublicOfferingPricingProps> = ({
  offering,
}) => {
  const { WrappedTabs, refNav, wrappedItems } = useWrappedTabs<BasePublicPlan>(
    offering.plans,
  );

  return (
    <Form onSubmit={() => {}}>
      {() => (
        <Panel
          title={translate('Plans')}
          actions={<ExportFullPriceList offering={offering} />}
          cardBordered
          id="pricing"
          className="public-offering-pricing"
        >
          {offering.plans.length === 1 ? (
            <PublicOfferingPricingPlanItem
              offering={offering}
              plan={offering.plans[0]}
            />
          ) : (
            <WrappedTabs
              ref={refNav}
              defaultActiveKey={offering.plans[0].uuid}
              items={offering.plans}
              wrappedItems={wrappedItems}
              renderTab={({ item }) => item.name}
              renderContent={({ item }) => (
                <PublicOfferingPricingPlanItem
                  key={item.uuid}
                  offering={offering}
                  plan={item}
                />
              )}
            />
          )}
        </Panel>
      )}
    </Form>
  );
};
