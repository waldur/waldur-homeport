import { useCurrentStateAndParams } from '@uirouter/react';
import { useMemo } from 'react';

import { translate } from '@/i18n';
import { getBillingTypes } from '@/marketplace/common/billingTypes';
import {
  showComponentsList,
  getFormLimitParser,
} from '@/marketplace/common/registry';

import { getLimitPeriods } from './components/ComponentLimitPeriodField';

export const parseComponent = (component, offering) => {
  const options = getBillingTypes();
  const limitPeriods = getLimitPeriods();
  const limitParser = offering ? getFormLimitParser(offering.type) : (x) => x;
  return {
    ...component,
    billing_type: options.find(
      (option) => option.value === component.billing_type,
    ),
    limit_period: limitPeriods.find(
      (option) => option.value === component.limit_period,
    ),
    min_value: limitParser({ [component.type]: component.min_value })[
      component.type
    ],
    max_value: limitParser({ [component.type]: component.max_value })[
      component.type
    ],
    limit_amount: limitParser({ [component.type]: component.limit_amount })[
      component.type
    ],
  };
};

export const useOfferingAccountingTableTabs = (offering) => {
  const { state } = useCurrentStateAndParams();
  return useMemo(
    () =>
      [
        showComponentsList(offering.type) && {
          key: 'components',
          title: translate('Components'),
          state: state.name,
          params: { tab: 'components' },
        },
        {
          key: 'plans',
          title: translate('Plans'),
          state: state.name,
          params: { tab: 'plans' },
        },
      ].filter(Boolean),
    [offering],
  );
};
