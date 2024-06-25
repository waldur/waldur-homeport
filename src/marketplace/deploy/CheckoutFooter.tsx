import { useSelector } from 'react-redux';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import { RatingStars } from '@waldur/marketplace/common/RatingStars';
import { ProviderLink } from '@waldur/marketplace/links/ProviderLink';
import { PriceTooltip } from '@waldur/price/PriceTooltip';

import { CheckoutPricingRow } from './CheckoutPricingRow';
import {
  concealPricesSelector,
  formCustomerSelector,
  formProjectSelector,
} from './utils';

export const CheckoutFooter = ({ dailyPrice, totalPrice, offering }) => {
  const customer = useSelector(formCustomerSelector);
  const project = useSelector(formProjectSelector);
  const shouldConcealPrices = useSelector(concealPricesSelector);

  return (
    <>
      {!shouldConcealPrices && (
        <>
          <CheckoutPricingRow
            label={
              <>
                {translate('Price per day')}
                <PriceTooltip />
              </>
            }
            value={defaultCurrency(dailyPrice)}
          />
          <CheckoutPricingRow
            label={
              <>
                {translate('Price per 30 days')}
                <PriceTooltip />
              </>
            }
            value={defaultCurrency(30 * dailyPrice)}
          />
        </>
      )}
      {customer && (
        <CheckoutPricingRow
          label={translate('Invoiced to')}
          value={customer.name}
        />
      )}
      {project && (
        <CheckoutPricingRow label={translate('Project')} value={project.name} />
      )}
      <CheckoutPricingRow label={translate('Offering')} value={offering.name} />
      <CheckoutPricingRow
        label={translate('Service provider')}
        value={
          <ProviderLink customer_uuid={offering.customer_uuid}>
            {offering.customer_name}
          </ProviderLink>
        }
      />
      {offering.rating && (
        <CheckoutPricingRow
          label={translate('Rating')}
          value={<RatingStars rating={offering.rating} size="medium" />}
        />
      )}
      <div className="d-flex justify-content-between fs-4">
        <p className="mb-0">{translate('Total')}</p>
        <p className="mb-0">{defaultCurrency(totalPrice)}</p>
      </div>
    </>
  );
};
