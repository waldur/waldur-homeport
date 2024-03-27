import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { RatingStars } from '@waldur/marketplace/common/RatingStars';
import { CheckoutPricingRow } from '@waldur/marketplace/deploy/CheckoutPricingRow';
import {
  concealPricesSelector,
  formErrorsSelector,
  formIsValidSelector,
} from '@waldur/marketplace/deploy/utils';
import { OrderOfferingSubmitButton } from '@waldur/marketplace/details/OrderSummary';
import { pricesSelector } from '@waldur/marketplace/details/plan/utils';
import { ProviderLink } from '@waldur/marketplace/links/ProviderLink';
import { Offering } from '@waldur/marketplace/types';
import { PriceTooltip } from '@waldur/price/PriceTooltip';
import { RootState } from '@waldur/store/reducers';
import { getCustomer, getProject } from '@waldur/workspace/selectors';

import { formAttributesSelector, formFlavorSelector } from './utils';

const getTotalStorage = (attributesData) =>
  attributesData.system_volume_size + (attributesData.data_volume_size || 0);

const getStoragePrice = (attributesData, components) => {
  const systemVolumeComponent = attributesData.system_volume_type
    ? `gigabytes_${attributesData.system_volume_type.name}`
    : 'storage';
  const systemVolumePrice =
    (attributesData.system_volume_size / 1024.0) *
    (components[systemVolumeComponent] || 0);

  const dataVolumeComponent = attributesData.data_volume_type
    ? `gigabytes_${attributesData.data_volume_type.name}`
    : 'storage';
  const dataVolumePrice =
    ((attributesData.data_volume_size || 0) / 1024.0) *
    (components[dataVolumeComponent] || 0);

  return systemVolumePrice + dataVolumePrice;
};

const getDailyPrice = (attributesData, components) => {
  /**
   * In Marketplace OpenStack plugin storage prices are stored per GB.
   * But in UI storage is storead in MB.
   * Therefore we should convert storage from GB to MB for price estimatation.
   */
  if (components && attributesData.flavor) {
    const cpu = attributesData.flavor.cores * components.cores;
    const ram = (attributesData.flavor.ram * components.ram) / 1024.0;
    const storagePrice = getStoragePrice(attributesData, components);

    return cpu + ram + storagePrice;
  } else {
    return 0;
  }
};

interface CheckoutSummaryProps {
  offering: Offering;
  updateMode?: boolean;
}

export const CheckoutSummary = ({
  offering,
  updateMode,
}: CheckoutSummaryProps) => {
  const formIsValid = useSelector(formIsValidSelector);
  const formAttributesData = useSelector(formAttributesSelector);
  const errors = useSelector(formErrorsSelector);
  const flavor = useSelector(formFlavorSelector);

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

  return (
    <>
      {formIsValid && (
        <div className="block-summary bg-gray-100 mb-10 fs-8 fw-bold">
          {formAttributesData.name && (
            <CheckoutPricingRow
              label={translate('VM name')}
              value={formAttributesData.name}
            />
          )}
          <CheckoutPricingRow
            label={translate('Image')}
            value={formAttributesData.image && formAttributesData.image.name}
          />
          <CheckoutPricingRow
            label={translate('Flavor')}
            value={flavor?.name}
          />
          <CheckoutPricingRow
            label={translate('vCPU')}
            value={`${flavor?.cores || '-'} cores`}
          />
          <CheckoutPricingRow
            label={translate('RAM')}
            value={formatFilesize(flavor?.ram)}
          />
          <CheckoutPricingRow
            label={translate('Total storage')}
            value={formatFilesize(getTotalStorage(formAttributesData))}
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

      <OrderOfferingSubmitButton
        formData={{ attributes: formAttributesData }}
        updateMode={updateMode}
        offering={offering}
        customer={customer}
        errors={errors}
        formValid={formIsValid}
        project={project}
      />
    </>
  );
};
