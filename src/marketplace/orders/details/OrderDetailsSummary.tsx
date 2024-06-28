import React from 'react';
import { connect } from 'react-redux';
import { isValid } from 'redux-form';

import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { ORDER_FORM_ID } from '@waldur/marketplace/details/constants';
import { SummaryTable } from '@waldur/marketplace/details/OrderSummary';
import { pricesSelector } from '@waldur/marketplace/details/plan/utils';
import {
  OfferingFormData,
  OrderSummaryProps,
} from '@waldur/marketplace/details/types';
import { Offering } from '@waldur/marketplace/types';
import { orderFormDataSelector } from '@waldur/marketplace/utils';
import { isVisible } from '@waldur/store/config';
import { getCustomer, getProject } from '@waldur/workspace/selectors';
import { Customer, Project } from '@waldur/workspace/types';

const PureOrderDetailsSummary: React.FC<OrderSummaryProps> = (
  props: OrderSummaryProps,
) => <SummaryTable {...props} />;

interface OrderDetailsSummary {
  customer: Customer;
  project?: Project;
  total: number;
  formData: OfferingFormData;
  formValid: boolean;
}

const mapStateToProps = (state, ownProps) => ({
  customer: getCustomer(state),
  project: getProject(state),
  total: pricesSelector(state, ownProps).total,
  formData: orderFormDataSelector(state),
  formValid: isValid(ORDER_FORM_ID)(state),
  shouldConcealPrices: isVisible(state, MarketplaceFeatures.conceal_prices),
});

export const OrderDetailsSummary = connect<
  OrderDetailsSummary,
  {},
  { offering: Offering }
>(mapStateToProps)(PureOrderDetailsSummary);
