import { reduxForm } from 'redux-form';
import { BasePublicPlan, PublicOfferingDetails } from 'waldur-js-client';

import { Panel } from '@waldur/core/Panel';
import { useWrappedTabs } from '@waldur/core/WrappedTabs';
import { translate } from '@waldur/i18n';
import { ORDER_FORM_ID } from '@waldur/marketplace/details/constants';

import { ExportFullPriceList } from './ExportFullPriceList';
import { PublicOfferingPricingPlanItem } from './PublicOfferingPricingPlanItem';

import './PublicOfferingPricing.scss';

interface PublicOfferingPricingProps {
  offering: PublicOfferingDetails;
}

export const PublicOfferingPricing = reduxForm<{}, PublicOfferingPricingProps>({
  form: ORDER_FORM_ID,
  touchOnChange: true,
})(({ offering }) => {
  const { WrappedTabs, refNav, wrappedItems } = useWrappedTabs<BasePublicPlan>(
    offering.plans,
  );

  return (
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
  );
});
