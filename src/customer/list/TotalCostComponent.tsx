import * as React from 'react';
import { connect } from 'react-redux';
import { getFormValues } from 'redux-form';

import { Query } from '@waldur/core/Query';
import { ENV } from '@waldur/core/services';
import { translate } from '@waldur/i18n';

import * as api from './api';
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
}

interface CustomerListComponentProps {
  customerListFilter: CustomerFilterData;
}

const loadData = async (filter: CustomerFilterData) => {
  if (!filter || !filter.accounting_period) {
    return { total: 0 };
  }
  const params = {
    accounting_is_running: filter.accounting_is_running
      ? filter.accounting_is_running.value
      : undefined,
    ...filter.accounting_period.value,
  };
  const data = await api.getTotal({ params });
  // VAT is not included only when accounting mode is activated
  if (ENV.accountingMode === 'accounting') {
    return { total: data.price };
  } else {
    return { total: data.total };
  }
};

const TotalCostComponent: React.FC<CustomerListComponentProps> = props => (
  <Query variables={props.customerListFilter} loader={loadData}>
    {({ loading, error, data }) => {
      if (loading) {
        return <span>{translate('Loading')}</span>;
      }
      if (error) {
        return <span>{translate('Unable to load data.')}</span>;
      }
      return <TotalCostField total={data.total} />;
    }}
  </Query>
);

const mapStateToProps = state => ({
  customerListFilter: getFormValues('customerListFilter')(state),
});

export const TotalCostContainer = connect(mapStateToProps)(
  TotalCostComponent,
) as React.ComponentType<{}>;
