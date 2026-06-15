import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { billingTotalCostRetrieve } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { FinancialReportsFilterFormData } from '@/table/generated/FinancialReportsFilter';
import { useFilterValues } from '@/table/useFilterValues';

import { TotalCostField } from './TotalCostField';

const loadData = async (filter: FinancialReportsFilterFormData) => {
  if (!filter || !filter.accounting_period) {
    return { total: 0 };
  }
  const response = await billingTotalCostRetrieve({
    query: {
      customer_uuid: filter.customer?.customer_uuid,
      accounting_is_running:
        filter.accounting_is_running &&
        filter.accounting_is_running.value !== 'undefined'
          ? filter.accounting_is_running.value
          : undefined,
      ...filter.accounting_period.value,
    },
  });
  // VAT is not included only when accounting mode is activated
  if (ENV.accountingMode === 'accounting') {
    return { total: response.data.price };
  } else {
    return { total: response.data.total };
  }
};

export const TotalCostContainer: React.FC = () => {
  const values = useFilterValues(
    'customerList',
  ) as FinancialReportsFilterFormData;

  const {
    isLoading: loading,
    error,
    data: value,
  } = useQuery({
    queryKey: ['TotalCostComponent', values],
    queryFn: () => loadData(values),
  });
  if (loading) {
    return (
      <>
        {translate('Loading total cost')} <LoadingSpinnerSimple />
      </>
    );
  }
  if (error) {
    return <>{translate('Unable to load data.')}</>;
  }
  return <TotalCostField total={value ? value.total : 0} />;
};
