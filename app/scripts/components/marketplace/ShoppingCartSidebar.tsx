import * as React from 'react';
import { connect } from 'react-redux';

import { defaultCurrency } from '@waldur/core/services';
import { getShoppingCartTotal } from '@waldur/marketplace/store/selectors';
import { getCustomer, getProject } from '@waldur/workspace/selectors';
import { Customer, Project } from '@waldur/workspace/types';

interface ShoppingCartSidebarProps {
  total: number;
  customer: Customer;
  project: Project;
}

const PureShoppingCartSidebar = (props: ShoppingCartSidebarProps) => (
  <aside>
    <h3>Order Summary</h3>
    <table className="table">
      <tbody>
        <tr>
          <td><strong>Invoiced to</strong></td>
          <td>{props.customer.name}</td>
        </tr>
        <tr>
          <td><strong>Project</strong></td>
          <td>{props.project.name}</td>
        </tr>
        <tr>
          <td className="text-lg">Total</td>
          <td className="text-lg">
            {defaultCurrency(props.total)}
          </td>
        </tr>
      </tbody>
    </table>
  </aside>
);

const mapStateToProps = state => ({
  customer: getCustomer(state),
  project: getProject(state),
  total: getShoppingCartTotal(state),
});

export const ShoppingCartSidebar = connect(mapStateToProps)(PureShoppingCartSidebar);
