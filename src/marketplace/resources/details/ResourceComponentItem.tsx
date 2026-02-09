import { OfferingComponent } from 'waldur-js-client';

import { translate } from '@waldur/i18n';

import { getBillingTypeLabel } from '../usage/utils';

import { QuotaCell } from './QuotaCell';
import { QuotaSingleView } from './QuotaSingleView';

interface ResourceComponentItemProps {
  component: OfferingComponent;
  resource: any;
  expanded?: boolean;
}

const normalize = (value: number, factor: number) => {
  const result = (value || 0) / (factor || 1);
  return Number.isInteger(result) ? result.toFixed() : result.toFixed(2);
};

export const getQuotaCellProps = (component: OfferingComponent, resource) => {
  if (!component) {
    return { usage: '', limit: '', title: '' };
  }
  return {
    usage:
      component.billing_type === 'limit' && resource.limit_usage
        ? normalize(resource.limit_usage[component.type], component.factor)
        : normalize(resource.current_usages[component.type], component.factor),
    limit:
      (component.billing_type === 'usage' && resource.limits[component.type]) ||
      component.billing_type === 'limit'
        ? normalize(resource.limits[component.type], component.factor)
        : null,
    title: component.name + ' ' + component.measured_unit,
  };
};

export const ResourceComponentItem = ({
  component,
  resource,
  expanded = false,
}: ResourceComponentItemProps) => {
  const props = getQuotaCellProps(component, resource);

  const billingType = getBillingTypeLabel(component.billing_type);
  const limitPeriod = component.limit_period;

  if (expanded) {
    return (
      <QuotaSingleView
        {...props}
        billingType={billingType}
        limitFrequency={
          // limit_period options: total, month, quarterly, annual
          component.billing_type === 'limit' &&
          (limitPeriod === 'total'
            ? translate('Total')
            : limitPeriod === 'quarterly'
              ? translate('Quarterly')
              : limitPeriod === 'annual'
                ? translate('Annual')
                : translate('Monthly'))
        }
      />
    );
  }

  return <QuotaCell {...props} description={billingType} />;
};
