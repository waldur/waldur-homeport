import React from 'react';
import { connect } from 'react-redux';
import { getFormValues, isValid } from 'redux-form';

import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogo';
import { FORM_ID } from '@waldur/marketplace/details/constants';
import { SummaryTable } from '@waldur/marketplace/details/OrderSummary';
import { pricesSelector } from '@waldur/marketplace/details/plan/utils';
import {
  OrderSummaryProps,
  OfferingFormData,
} from '@waldur/marketplace/details/types';
import { Offering } from '@waldur/marketplace/types';
import { isVisible } from '@waldur/store/config';
import { getCustomer, getProject } from '@waldur/workspace/selectors';
import { Customer, Project } from '@waldur/workspace/types';

const PureOrderItemDetailsSummary: React.FC<OrderSummaryProps> = (
  props: OrderSummaryProps,
) => (
  <>
    <OfferingLogo src={props.offering.thumbnail} size="small" />
    <SummaryTable {...props} />
  </>
);

interface OrderItemDetailsSummary {
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
  formData: getFormValues(FORM_ID)(state),
  formValid: isValid(FORM_ID)(state),
  shouldConcealPrices: isVisible(state, 'marketplace.conceal_prices'),
});

export const OrderItemDetailsSummary = connect<
  OrderItemDetailsSummary,
  {},
  { offering: Offering }
>(mapStateToProps)(PureOrderItemDetailsSummary);
