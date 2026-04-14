import React from 'react';
import { connect } from 'react-redux';
import { useAsync } from 'react-use';
import { billingTotalCostRetrieve } from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import { LoadingSpinnerSimple } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { ServiceProvider } from '@waldur/marketplace/types';
import { type RootState } from '@waldur/store/reducers';
import { selectFiltersStorage } from '@waldur/table/selectors';
import { FilterItem } from '@waldur/table/types';

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
  const { loading, error, value } = useAsync(
    () =>
      loadData(
        (props.customerListFilter || []).reduce(
          (acc, filter) => Object.assign(acc, { [filter.name]: filter.value }),
          {},
        ) as CustomerFilterData,
      ),
    [props.customerListFilter],
  );
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
