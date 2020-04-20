import * as React from 'react';
import * as Table from 'react-bootstrap/lib/Table';
import { useSelector } from 'react-redux';
import { getFormValues, isValid } from 'redux-form';

import { Panel } from '@waldur/core/Panel';
import { defaultCurrency } from '@waldur/core/services';
import { formatFilesize } from '@waldur/core/utils';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { ShoppingCartButtonContainer } from '@waldur/marketplace/cart/ShoppingCartButtonContainer';
import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogo';
import { RatingStars } from '@waldur/marketplace/common/RatingStars';
import { OfferingCompareButtonContainer } from '@waldur/marketplace/compare/OfferingCompareButtonContainer';
import { pricesSelector } from '@waldur/marketplace/details/plan/utils';
import { formatOrderItemForCreate } from '@waldur/marketplace/details/utils';
import { ProviderLink } from '@waldur/marketplace/links/ProviderLink';
import { Offering } from '@waldur/marketplace/types';
import { Quota } from '@waldur/openstack/types';
import { parseQuotas, parseQuotasUsage } from '@waldur/openstack/utils';
import { PriceTooltip } from '@waldur/price/PriceTooltip';
import { QuotaUsageBarChart } from '@waldur/quotas/QuotaUsageBarChart';
import { getCustomer, getProject } from '@waldur/workspace/selectors';

import { Flavor } from './types';

interface FormData {
  name?: string;
  service?: { name: string };
  image?: { name: string };
  flavor?: Flavor;
  attributes?: Record<string, any>;
}

interface OwnProps {
  offering: Offering;
}

const getTotalStorage = formData =>
  formData.system_volume_size + (formData.data_volume_size || 0);

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
    (formData.data_volume_size / 1024.0) *
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

const getMonthlyPrice = (formData, components) =>
  getDailyPrice(formData, components) * 30;

function extendVolumeTypeQuotas(formData, usages, limits) {
  const quotas = [];
  if (isFeatureVisible('openstack.volume-types')) {
    const required = {};
    if (formData.data_volume_type) {
      const key = `gigabytes_${formData.data_volume_type.name}`;
      required[key] = (required[key] || 0) + formData.data_volume_size / 1024.0;
    }
    if (formData.system_volume_type) {
      const key = `gigabytes_${formData.system_volume_type.name}`;
      required[key] =
        (required[key] || 0) + formData.system_volume_size / 1024.0;
    }
    Object.keys(limits)
      .filter(key => key.startsWith('gigabytes_'))
      .forEach(key => {
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

const getQuotas = ({ formData, usages, limits, project, components }) => {
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
    ...extendVolumeTypeQuotas(formData, usages, limits),
  ];
  if (project && project.billing_price_estimate) {
    quotas.push({
      name: 'cost',
      usage: project.billing_price_estimate.total,
      limit: project.billing_price_estimate.limit,
      required: getMonthlyPrice(formData, components),
    });
  }
  return quotas;
};

const formDataSelector = state =>
  (getFormValues('marketplaceOffering')(state) || {}) as FormData;

const formHasFlavorSelector = state => Boolean(formDataSelector(state).flavor);

const formIsValidSelector = state => isValid('marketplaceOffering')(state);

const formAttributesSelector = state => {
  const formData = formDataSelector(state);
  return formData.attributes || {};
};

const flavorSelector = state => {
  const formAttrs = formAttributesSelector(state);
  return formAttrs.flavor ? formAttrs.flavor : {};
};

export const OpenstackInstanceCheckoutSummary: React.FC<OwnProps> = ({
  offering,
}) => {
  const customer = useSelector(getCustomer);
  const project = useSelector(getProject);
  const formIsValid = useSelector(formIsValidSelector);
  const formHasFlavor = useSelector(formHasFlavorSelector);
  const formData = useSelector(formAttributesSelector);
  const flavor = useSelector(flavorSelector);
  const total = useSelector(state => pricesSelector(state, { offering })).total;
  const components = React.useMemo(
    () => (offering.plans.length > 0 ? offering.plans[0].prices : {}),
    [offering],
  );
  const usages = React.useMemo(() => parseQuotasUsage(offering.quotas || []), [
    offering,
  ]);
  const limits = React.useMemo(() => parseQuotas(offering.quotas || []), [
    offering,
  ]);
  const dailyPrice = React.useMemo(() => getDailyPrice(formData, components), [
    formData,
    components,
  ]);

  const quotas = React.useMemo(
    () => getQuotas({ formData, usages, limits, project, components }),
    [formData, usages, limits, project, components],
  );

  const orderItem = React.useMemo(
    () =>
      formatOrderItemForCreate({
        formData: { attributes: formData },
        offering,
        customer,
        project,
        total,
        formValid: formIsValid,
      }),
    [formData, offering, customer, project, total, formIsValid],
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
      {!offering.shared && !offering.billable && (
        <p>
          {translate(
            'Note that this virtual machine will not be charged separately for {organization}.',
            {
              organization: customer.name,
            },
          )}
        </p>
      )}
      <OfferingLogo src={offering.thumbnail} size="small" />
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
            <tr>
              <td>
                <strong>{translate('Price per day')}</strong> <PriceTooltip />
              </td>
              <td>{defaultCurrency(dailyPrice)}</td>
            </tr>
            <tr>
              <td>
                <strong>{translate('Price per 30 days')}</strong>{' '}
                <PriceTooltip />
              </td>
              <td>{defaultCurrency(30 * dailyPrice)}</td>
            </tr>
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
              <td>{project ? project.name : <span>&mdash;</span>}</td>
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
        <Panel title={translate('Limits')}>
          <QuotaUsageBarChart quotas={quotas} />
        </Panel>
      )}
      <div className="display-flex justify-content-between">
        <ShoppingCartButtonContainer
          item={orderItem}
          flavor="primary"
          disabled={!formIsValid}
        />
        <OfferingCompareButtonContainer
          offering={offering}
          flavor="secondary"
        />
      </div>
    </>
  );
};
