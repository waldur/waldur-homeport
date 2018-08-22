import * as React from 'react';
import { connect } from 'react-redux';
import { getFormValues, isValid } from 'redux-form';

import { Link } from '@waldur/core/Link';
import { defaultCurrency } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { ShoppingCartButtonContainer } from '@waldur/marketplace/cart/ShoppingCartButtonContainer';
import { RatingStars } from '@waldur/marketplace/common/RatingStars';
import { OfferingCompareButtonContainer } from '@waldur/marketplace/compare/OfferingCompareButtonContainer';
import { Offering } from '@waldur/marketplace/types';
import { getCustomer, getProject } from '@waldur/workspace/selectors';
import { Customer, Project } from '@waldur/workspace/types';

import { OfferingFormData } from './types';

interface OrderSummaryProps {
  offering: Offering;
  customer: Customer;
  project: Project;
  formData: OfferingFormData;
  formValid: boolean;
}

const PureOrderSummary = (props: OrderSummaryProps) => (
  <>
    <img src={props.offering.thumbnail} className="img-lg"/>
    <table className="table">
      <tbody>
        <tr>
          <td><strong>{translate('Offering')}</strong></td>
          <td>{props.offering.name}</td>
        </tr>
        <tr>
          <td><strong>{translate('Vendor')}</strong></td>
          <td>
            <Link
              state="marketplace-provider-details"
              params={{customer_uuid: props.offering.customer_uuid}}
            >
              {props.offering.customer_name}
            </Link>
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
        <tr>
          <td><strong>{translate('Project')}</strong></td>
          <td>{props.project.name}</td>
        </tr>
        {props.formData && props.formData.plan && (
          <tr>
            <td className="text-lg">{translate('Price')}</td>
            <td className="text-lg">
              {defaultCurrency(props.formData.plan.unit_price)}
            </td>
          </tr>
        )}
      </tbody>
    </table>
    <div className="display-flex justify-content-between">
      <ShoppingCartButtonContainer
        item={
          {
            offering: props.offering,
            plan: props.formData ? props.formData.plan : undefined,
            attributes: props.formData ? props.formData.attributes : undefined,
          }
        }
        flavor="primary"
        disabled={!props.formValid}
      />
      <OfferingCompareButtonContainer offering={props.offering} flavor="secondary"/>
    </div>
  </>
);

const mapStateToProps = state => ({
  customer: getCustomer(state),
  project: getProject(state),
  formData: getFormValues('marketplaceOffering')(state),
  formValid: isValid('marketplaceOffering')(state),
});

export const OrderSummary = connect(mapStateToProps)(PureOrderSummary);
