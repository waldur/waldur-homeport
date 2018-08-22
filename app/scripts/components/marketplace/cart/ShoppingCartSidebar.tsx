import * as React from 'react';
import { connect } from 'react-redux';

import { defaultCurrency } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { getCustomer, getProject } from '@waldur/workspace/selectors';
import { Customer, Project } from '@waldur/workspace/types';

import './ShoppingCartSidebar.scss';
import { getTotal } from './store/selectors';

interface ShoppingCartSidebarProps {
  total: number;
  customer: Customer;
  project: Project;
}

export const PureShoppingCartSidebar = (props: ShoppingCartSidebarProps) => (
  <aside className="shopping-cart-sidebar">
    <div className="shopping-cart-sidebar-title">
      {translate('Order Summary')}
    </div>
    <table className="table">
      <tbody>
        <tr>
          <td><strong>{translate('Invoiced to')}</strong></td>
          <td>{props.customer.name}</td>
        </tr>
        <tr>
          <td><strong>{translate('Project')}</strong></td>
          <td>{props.project.name}</td>
        </tr>
        {props.total ? (
          <tr>
            <td className="text-lg">{translate('Total')}</td>
            <td className="text-lg">
              {defaultCurrency(props.total)}
            </td>
          </tr>
        ) : null}
      </tbody>
    </table>

    <a className="btn btn-outline btn-default">
      <i className="fa fa-file-pdf-o m-r-sm"/>
      {' '}
      {translate('Download order PDF file')}
    </a>
  </aside>
);

const mapStateToProps = state => ({
  customer: getCustomer(state),
  project: getProject(state),
  total: getTotal(state),
});

export const ShoppingCartSidebar = connect(mapStateToProps)(PureShoppingCartSidebar);
