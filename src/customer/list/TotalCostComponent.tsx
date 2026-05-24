import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { connect } from 'react-redux';
import { billingTotalCostRetrieve } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { ServiceProvider } from '@/marketplace/types';
import { type RootState } from '@/store/reducers';
import { selectFiltersStorage } from '@/table/selectors';
import { FilterItem } from '@/table/types';

import { TotalCostField } from './TotalCostField';

interface CustomerFilterData {
  accounting_is_running?: {
    value: boolean;
  };
  month: number;
  year: number;
  accounting_period?: {
    label: string;
    value: {
      year: number;
      month: number;
    };
  };
  provider?: ServiceProvider;
}

interface CustomerListComponentProps {
  customerListFilter: FilterItem[];
}

const loadData = async (filter: CustomerFilterData) => {
  if (!filter || !filter.accounting_period) {
    return { total: 0 };
  }
  const response = await billingTotalCostRetrieve({
    query: {
      customer_uuid: filter.provider?.customer_uuid,
      accounting_is_running: filter.accounting_is_running
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

const TotalCostComponent: React.FC<CustomerListComponentProps> = (props) => {
  const {
    isLoading: loading,
    error,
    data: value,
  } = useQuery({
    queryKey: ['TotalCostComponent', props.customerListFilter],

    queryFn: () =>
      loadData(
        (props.customerListFilter || []).reduce(
          (acc, filter) => Object.assign(acc, { [filter.name]: filter.value }),
          {},
        ) as CustomerFilterData,
      ),
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
  return <TotalCostField total={value.total} />;
};

const mapStateToProps = (state: RootState) => ({
  customerListFilter: selectFiltersStorage(state, 'customerList'),
});

export const TotalCostContainer = connect(mapStateToProps)(TotalCostComponent);
