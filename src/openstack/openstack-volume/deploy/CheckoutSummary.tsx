import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { Tip } from '@waldur/core/Tooltip';
import { formatFilesize } from '@waldur/core/utils';
import { FieldError } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { ShoppingCartButtonContainer } from '@waldur/marketplace/cart/ShoppingCartButtonContainer';
import { RatingStars } from '@waldur/marketplace/common/RatingStars';
import { CheckoutPricingRow } from '@waldur/marketplace/deploy/CheckoutPricingRow';
import {
  concealPricesSelector,
  formErrorsSelector,
  formIsValidSelector,
} from '@waldur/marketplace/deploy/utils';
import { pricesSelector } from '@waldur/marketplace/details/plan/utils';
import { formatOrderItemForCreate } from '@waldur/marketplace/details/utils';
import { ProviderLink } from '@waldur/marketplace/links/ProviderLink';
import { Offering } from '@waldur/marketplace/types';
import { PriceTooltip } from '@waldur/price/PriceTooltip';
import { RootState } from '@waldur/store/reducers';
import { getCustomer, getProject } from '@waldur/workspace/selectors';

import { formAttributesSelector } from './utils';

const getDailyPrice = (attributesData, components) => {
  /**
   * In Marketplace OpenStack plugin storage prices are stored per GB.
   * But in UI storage is storead in MB.
   * Therefore we should convert storage from GB to MB for price estimatation.
   */

  if (!components || !attributesData.size) {
    return 0;
  }
  const size = attributesData.size / 1024.0;
  const component = attributesData.type
    ? `gigabytes_${attributesData.type.name}`
    : 'storage';
  return size * (components[component] || 0);
};

interface CheckoutSummaryProps {
  offering: Offering;
}

export const CheckoutSummary = ({ offering }: CheckoutSummaryProps) => {
  const formIsValid = useSelector(formIsValidSelector);
  const formAttributesData = useSelector(formAttributesSelector);
  const errors = useSelector(formErrorsSelector);

  const customer = useSelector(getCustomer);
  const project = useSelector(getProject);
  const shouldConcealPrices = useSelector(concealPricesSelector);
  const prices = useSelector((state: RootState) =>
    pricesSelector(state, { offering }),
  );
  const components = useMemo(
    () => (offering.plans.length > 0 ? offering.plans[0].prices : {}),
    [offering],
  );
  const dailyPrice = useMemo(
    () => getDailyPrice(formAttributesData, components),
    [formAttributesData, components],
  );

  const orderItem = useMemo(
    () =>
      formatOrderItemForCreate({
        formData: { attributes: formAttributesData },
        offering,
        customer,
        project,
        prices,
        formValid: formIsValid,
      }),
    [formAttributesData, offering, customer, project, prices, formIsValid],
  );

  return (
    <>
      {!!formAttributesData.size && (
        <div className="order-summary bg-gray-100 mb-10 fs-8 fw-bold">
          {formAttributesData.name && (
            <CheckoutPricingRow
              label={translate('Name')}
              value={formAttributesData.name}
            />
          )}
          <CheckoutPricingRow
            label={translate('Storage')}
            value={formatFilesize(formAttributesData.size)}
          />
          {!shouldConcealPrices && (
            <CheckoutPricingRow
              label={
                <>
                  {translate('Price per day')}
                  <PriceTooltip />
                </>
              }
              value={defaultCurrency(dailyPrice)}
            />
          )}
          {!shouldConcealPrices && (
            <CheckoutPricingRow
              label={
                <>
                  {translate('Price per 30 days')}
                  <PriceTooltip />
                </>
              }
              value={defaultCurrency(30 * dailyPrice)}
            />
          )}
          <CheckoutPricingRow
            label={translate('Invoiced to')}
            value={customer.name}
          />
          <CheckoutPricingRow
            label={translate('Project')}
            value={project ? project.name : <>&mdash;</>}
          />
          <CheckoutPricingRow
            label={translate('Offering')}
            value={offering.name}
          />
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
            <p className="mb-0">{defaultCurrency(prices.total)}</p>
          </div>
        </div>
      )}

      <Tip
        label={
          Boolean(errors?.attributes) && (
            <FieldError error={errors?.attributes} />
          )
        }
        id="offering-button-errors"
        autoWidth
      >
        <ShoppingCartButtonContainer
          item={orderItem}
          flavor="primary"
          disabled={!formIsValid}
          className="w-100"
        />
      </Tip>
    </>
  );
};
