import * as React from 'react';
import { connect } from 'react-redux';
import { isValid, getFormValues } from 'redux-form';

import { defaultCurrency } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { ShoppingCartButtonContainer } from '@waldur/marketplace/cart/ShoppingCartButtonContainer';
import { BillingPeriod } from '@waldur/marketplace/common/BillingPeriod';
import { RatingStars } from '@waldur/marketplace/common/RatingStars';
import { OfferingCompareButtonContainer } from '@waldur/marketplace/compare/OfferingCompareButtonContainer';
import { ProviderLink } from '@waldur/marketplace/links/ProviderLink';
import { Offering } from '@waldur/marketplace/types';
import { getCustomer, getProject } from '@waldur/workspace/selectors';
import { Project, Customer } from '@waldur/workspace/types';

import { totalPriceSelector } from './selectors';
import { OrderSummaryProps, OfferingFormData } from './types';
import { getOrderItem } from './utils';

const PureOrderSummary = (props: OrderSummaryProps) => (
  <>
    <img src={props.offering.thumbnail} className="img-lg"/>
    <table className="table offering-details-section-table">
      <tbody>
        <tr>
          <td><strong>{translate('Offering')}</strong></td>
          <td>{props.offering.name}</td>
        </tr>
        <tr>
          <td><strong>{translate('Vendor')}</strong></td>
          <td>
            <ProviderLink customer_uuid={props.offering.customer_uuid}>
              {props.offering.customer_name}
            </ProviderLink>
          </td>
        </tr>
        {props.offering.rating && (
          <tr>
            <td><strong>{translate('Rating')}</strong></td>
            <td><RatingStars rating={props.offering.rating} size="medium"/></td>
          </tr>
        )}
        <tr>
          <td><strong>{translate('Invoiced to')}</strong></td>
          <td>{props.customer.name}</td>
        </tr>
        {props.project && (
          <tr>
            <td><strong>{translate('Project')}</strong></td>
            <td>{props.project.name}</td>
          </tr>
        )}
        {props.formData && props.formData.plan && (
          <tr>
            <td className="text-lg">
              <BillingPeriod unit={props.formData.plan.unit}/>
            </td>
            <td className="text-lg">
              {defaultCurrency(props.total)}
            </td>
          </tr>
        )}
      </tbody>
    </table>
    <div className="display-flex justify-content-between">
      <ShoppingCartButtonContainer
        item={getOrderItem(props)}
        flavor="primary"
        disabled={!props.formValid}
      />
      <OfferingCompareButtonContainer offering={props.offering} flavor="secondary"/>
    </div>
  </>
);

interface OrderSummaryStateProps {
  customer: Customer;
  project?: Project;
  total: number;
  formData: OfferingFormData;
  formValid: boolean;
}

const mapStateToProps = state => ({
  customer: getCustomer(state),
  project: getProject(state),
  total: totalPriceSelector(state),
  formData: getFormValues('marketplaceOffering')(state),
  formValid: isValid('marketplaceOffering')(state),
});

export const OrderSummary = connect<OrderSummaryStateProps, {}, {offering: Offering}>(mapStateToProps)(PureOrderSummary);
