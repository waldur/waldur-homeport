import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { CheckoutFooter } from '@waldur/marketplace/deploy/CheckoutFooter';
import { CheckoutPricingRow } from '@waldur/marketplace/deploy/CheckoutPricingRow';
import {
  formErrorsSelector,
  formIsValidSelector,
} from '@waldur/marketplace/deploy/utils';
import { OrderSubmitButton } from '@waldur/marketplace/details/OrderSubmitButton';
import { pricesSelector } from '@waldur/marketplace/details/plan/utils';
import { Offering } from '@waldur/marketplace/types';
import {
  orderFormAttributesSelector,
  orderFormDataSelector,
} from '@waldur/marketplace/utils';
import { RootState } from '@waldur/store/reducers';

import { formFlavorSelector } from './utils';

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
  const formAttributesData = useSelector(orderFormAttributesSelector);
  const formData = useSelector(orderFormDataSelector);
  const errors = useSelector(formErrorsSelector);
  const flavor = useSelector(formFlavorSelector);

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
      <div className="block-summary bg-gray-100 mb-10 fs-8 fw-bold">
        {formAttributesData.name && (
          <CheckoutPricingRow
            label={translate('VM name')}
            value={formAttributesData.name}
          />
        )}
        {formAttributesData.image && (
          <CheckoutPricingRow
            label={translate('Image')}
            value={formAttributesData.image.name}
          />
        )}

        {flavor && (
          <>
            <CheckoutPricingRow
              label={translate('Flavor')}
              value={flavor.name}
            />
            <CheckoutPricingRow
              label={translate('vCPU')}
              value={`${flavor.cores || '-'} cores`}
            />
            <CheckoutPricingRow
              label={translate('RAM')}
              value={formatFilesize(flavor.ram)}
            />
          </>
        )}
        <CheckoutPricingRow
          label={translate('Total storage')}
          value={formatFilesize(getTotalStorage(formAttributesData))}
        />
        <CheckoutFooter
          dailyPrice={dailyPrice}
          totalPrice={prices.total}
          offering={offering}
        />
      </div>

      <OrderSubmitButton
        formData={formData}
        updateMode={updateMode}
        offering={offering}
        errors={errors}
        formValid={formIsValid}
      />
    </>
  );
};
