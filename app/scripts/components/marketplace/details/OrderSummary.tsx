import * as React from 'react';
import { connect } from 'react-redux';

import { defaultCurrency } from '@waldur/core/services';
import { RatingStars } from '@waldur/marketplace/common/RatingStars';
import { CheckoutButton } from '@waldur/marketplace/details/CheckoutButton';
import { Product } from '@waldur/marketplace/types';
import { getCustomer, getProject } from '@waldur/workspace/selectors';
import { Customer, Project } from '@waldur/workspace/types';

interface OrderSummaryProps {
  product: Product;
  customer: Customer;
  project: Project;
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
    <img src={props.product.thumb} className="img-lg"/>
    <table className="table">
      <tbody>
        <tr>
          <td><strong>Product</strong></td>
          <td>{props.product.title}</td>
        </tr>
        <tr>
          <td><strong>Vendor</strong></td>
          <td>{props.product.vendor}</td>
        </tr>
        <tr>
          <td><strong>Rating</strong></td>
          <td><RatingStars rating={props.product.rating} size="medium"/></td>
        </tr>
        <tr>
          <td><strong>Invoiced to</strong></td>
          <td>{props.customer.name}</td>
        </tr>
        <tr>
          <td><strong>Project</strong></td>
          <td>{props.project.name}</td>
        </tr>
        <tr>
          <td className="text-lg">Price</td>
          <td className="text-lg">
            {defaultCurrency(props.product.price)}
          </td>
        </tr>
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
});

export const OrderSummary = connect(mapStateToProps)(PureOrderSummary);
