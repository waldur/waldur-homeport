import React from 'react';
import { Table } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { getFormValues, isValid } from 'redux-form';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { ShoppingCartButtonContainer } from '@waldur/marketplace/cart/ShoppingCartButtonContainer';
import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogo';
import { RatingStars } from '@waldur/marketplace/common/RatingStars';
import { FORM_ID } from '@waldur/marketplace/details/constants';
import { OfferingDetailsProps } from '@waldur/marketplace/details/OfferingDetails';
import { pricesSelector } from '@waldur/marketplace/details/plan/utils';
import { formatOrderForCreate } from '@waldur/marketplace/details/utils';
import { ProviderLink } from '@waldur/marketplace/links/ProviderLink';
import { Quota } from '@waldur/openstack/types';
import { parseQuotas, parseQuotasUsage } from '@waldur/openstack/utils';
import { PriceTooltip } from '@waldur/price/PriceTooltip';
import { QuotaUsageBarChart } from '@waldur/quotas/QuotaUsageBarChart';
import { isVisible } from '@waldur/store/config';
import { RootState } from '@waldur/store/reducers';
import { getCustomer, getProject } from '@waldur/workspace/selectors';

import { DYNAMIC_STORAGE_MODE } from '../constants';

import { OpenStackInstanceFormData } from './types';
import { getVolumeTypeRequirements } from './utils';

const getTotalStorage = (formData) =>
  (formData.system_volume_size || 0) + (formData.data_volume_size || 0);

const getStoragePrice = (formData, components) => {
  const systemVolumeComponent = formData.system_volume_type
    ? `gigabytes_${formData.system_volume_type.name}`
    : 'storage';
  const systemVolumePrice =
    (formData.system_volume_size / 1024.0) *
    (components[systemVolumeComponent] || 0);

  const dataVolumeComponent = formData.data_volume_type
    ? `gigabytes_${formData.data_volume_type.name}`
    : 'storage';
  const dataVolumePrice =
    ((formData.data_volume_size || 0) / 1024.0) *
    (components[dataVolumeComponent] || 0);

  return systemVolumePrice + dataVolumePrice;
};

const getDailyPrice = (formData, components) => {
  /**
   * In Marketplace OpenStack plugin storage prices are stored per GB.
   * But in UI storage is storead in MB.
   * Therefore we should convert storage from GB to MB for price estimatation.
   */
  if (components && formData.flavor) {
    const cpu = formData.flavor.cores * components.cores;
    const ram = (formData.flavor.ram * components.ram) / 1024.0;
    const storagePrice = getStoragePrice(formData, components);

    return cpu + ram + storagePrice;
  } else {
    return 0;
  }
};

function extendVolumeTypeQuotas(formData, usages, limits, storage_mode) {
  const quotas = [];
  if (storage_mode === DYNAMIC_STORAGE_MODE) {
    const required = getVolumeTypeRequirements(formData);
    Object.keys(limits)
      .filter((key) => key.startsWith('gigabytes_'))
      .forEach((key) => {
        quotas.push({
          name: key,
          usage: usages[key] || 0,
          limit: limits[key],
          required: required[key] || 0,
        });
      });
  }
  return quotas;
}

export const getQuotas = ({ formData, usages, limits, storage_mode }) => {
  const quotas: Quota[] = [
    {
      name: 'vcpu',
      usage: usages.cores,
      limit: limits.cores,
      required: formData.flavor ? formData.flavor.cores : 0,
    },
    {
      name: 'ram',
      usage: usages.ram,
      limit: limits.ram,
      required: formData.flavor ? formData.flavor.ram : 0,
    },
    {
      name: 'storage',
      usage: usages.disk,
      limit: limits.disk,
      required: getTotalStorage(formData) || 0,
    },
    ...extendVolumeTypeQuotas(formData, usages, limits, storage_mode),
  ];
  return quotas;
};

const formDataSelector = (state: RootState) =>
  (getFormValues(FORM_ID)(state) || {}) as OpenStackInstanceFormData;

const formHasFlavorSelector = (state: RootState) =>
  Boolean(formDataSelector(state).flavor);

const formIsValidSelector = (state: RootState) => isValid(FORM_ID)(state);

const formAttributesSelector = (state: RootState) => {
  const formData = formDataSelector(state);
  return formData.attributes || {};
};

const flavorSelector = (state: RootState) => {
  const formAttrs = formAttributesSelector(state);
  return formAttrs.flavor ? formAttrs.flavor : {};
};

export const OpenstackInstanceCheckoutSummary: React.FC<OfferingDetailsProps> =
  ({ offering }) => {
    const customer = useSelector(getCustomer);
    const project = useSelector(getProject);
    const shouldConcealPrices = useSelector((state: RootState) =>
      isVisible(state, 'marketplace.conceal_prices'),
    );
    const formIsValid = useSelector(formIsValidSelector);
    const formHasFlavor = useSelector(formHasFlavorSelector);
    const formData = useSelector(formAttributesSelector);
    const flavor = useSelector(flavorSelector);
    const prices = useSelector((state: RootState) =>
      pricesSelector(state, { offering }),
    );
    const components = React.useMemo(
      () => (offering.plans.length > 0 ? offering.plans[0].prices : {}),
      [offering],
    );
    const usages = React.useMemo(
      () => parseQuotasUsage(offering.quotas || []),
      [offering],
    );
    const limits = React.useMemo(
      () => parseQuotas(offering.quotas || []),
      [offering],
    );
    const dailyPrice = React.useMemo(
      () => getDailyPrice(formData, components),
      [formData, components],
    );

    const storage_mode = offering.plugin_options.storage_mode;

    const quotas = React.useMemo(
      () => getQuotas({ formData, usages, limits, storage_mode }),
      [formData, usages, limits, storage_mode],
    );

    const order = React.useMemo(
      () =>
        formatOrderForCreate({
          formData: { attributes: formData },
          offering,
          customer,
          project,
          prices,
          formValid: formIsValid,
        }),
      [formData, offering, customer, project, prices, formIsValid],
    );

    return (
      <>
        {!formIsValid && (
          <p id="invalid-info">
            {formHasFlavor &&
              translate(
                'Resource configuration is invalid. Please fix errors in form.',
              )}
            {!formHasFlavor &&
              translate('Please select flavor to see price estimate.')}
          </p>
        )}
        {customer && !offering.shared && !offering.billable && (
          <p>
            {translate(
              'Note that this virtual machine will not be charged separately for {organization}.',
              {
                organization: customer.name,
              },
            )}
          </p>
        )}
        <OfferingLogo src={offering.thumbnail} size="sm" />
        {formIsValid && (
          <Table bordered={true}>
            <tbody>
              {formData.name && (
                <tr>
                  <td>
                    <strong>{translate('VM name')}</strong>
                  </td>
                  <td>{formData.name}</td>
                </tr>
              )}
              <tr>
                <td>
                  <strong>{translate('Image')}</strong>
                </td>
                <td>{formData.image && formData.image.name}</td>
              </tr>
              <tr>
                <td>
                  <strong>{translate('Flavor')}</strong>
                </td>
                <td>{flavor.name}</td>
              </tr>
              <tr>
                <td>
                  <strong>{translate('vCPU')}</strong>
                </td>
                <td>{`${flavor.cores} cores`}</td>
              </tr>
              <tr>
                <td>
                  <strong>{translate('RAM')}</strong>
                </td>
                <td>{formatFilesize(flavor.ram)}</td>
              </tr>
              <tr>
                <td>
                  <strong>{translate('Total storage')}</strong>
                </td>
                <td>{formatFilesize(getTotalStorage(formData))}</td>
              </tr>
              {!shouldConcealPrices && (
                <tr>
                  <td>
                    <strong>{translate('Price per day')}</strong>{' '}
                    <PriceTooltip />
                  </td>
                  <td>{defaultCurrency(dailyPrice)}</td>
                </tr>
              )}
              {!shouldConcealPrices && (
                <tr>
                  <td>
                    <strong>{translate('Price per 30 days')}</strong>{' '}
                    <PriceTooltip />
                  </td>
                  <td>{defaultCurrency(30 * dailyPrice)}</td>
                </tr>
              )}
              <tr>
                <td>
                  <strong>{translate('Invoiced to')}</strong>
                </td>
                <td>{customer.name}</td>
              </tr>
              <tr>
                <td>
                  <strong>{translate('Project')}</strong>
                </td>
                <td>{project ? project.name : <>&mdash;</>}</td>
              </tr>
              <tr>
                <td>
                  <strong>{translate('Offering')}</strong>
                </td>
                <td>{offering.name}</td>
              </tr>
              <tr>
                <td>
                  <strong>{translate('Service provider')}</strong>
                </td>
                <td>
                  <ProviderLink customer_uuid={offering.customer_uuid}>
                    {offering.customer_name}
                  </ProviderLink>
                </td>
              </tr>
              {offering.rating && (
                <tr>
                  <td>
                    <strong>{translate('Rating')}</strong>
                  </td>
                  <td>
                    <RatingStars rating={offering.rating} size="medium" />
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
        {components && (
          <>
            <h3 className="header-bottom-border">{translate('Limits')}</h3>
            <QuotaUsageBarChart quotas={quotas} />
          </>
        )}
        <div className="d-flex justify-content-between mt-5">
          <ShoppingCartButtonContainer
            item={order}
            flavor="primary"
            disabled={!formIsValid}
          />
        </div>
      </>
    );
  };
