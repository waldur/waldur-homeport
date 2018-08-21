import * as React from 'react';
import { connect } from 'react-redux';
import { getFormValues } from 'redux-form';

import { Link } from '@waldur/core/Link';
import { defaultCurrency } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { RatingStars } from '@waldur/marketplace/common/RatingStars';
import { CheckoutButton } from '@waldur/marketplace/details/CheckoutButton';
import { Offering } from '@waldur/marketplace/types';
import { getCustomer, getProject } from '@waldur/workspace/selectors';
import { Customer, Project } from '@waldur/workspace/types';

import { OfferingFormData } from './types';

interface OrderSummaryProps {
  offering: Offering;
  customer: Customer;
  project: Project;
  formData: OfferingFormData;
}

const CompareButton = () => (
  <button
    type="button"
    className="btn btn-outline btn-sm btn-default">
    <i className="fa fa fa-balance-scale"/>
  </button>
);

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
      <CheckoutButton/>
      <CompareButton/>
    </div>
  </>
);

const mapStateToProps = state => ({
  customer: getCustomer(state),
  project: getProject(state),
  formData: getFormValues('marketplaceOffering')(state),
});

export const OrderSummary = connect(mapStateToProps)(PureOrderSummary);
