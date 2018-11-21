import * as React from 'react';
import { connect } from 'react-redux';

import { DownloadLink } from '@waldur/core/DownloadLink';
import { defaultCurrency } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { getCustomer, getProject } from '@waldur/workspace/selectors';
import { Customer, Project } from '@waldur/workspace/types';

import './ShoppingCartSidebar.scss';
import { getTotal } from './store/selectors';

interface ShoppingCartSidebarProps {
  total: number;
  file?: string;
  customer: Customer;
  project: Project;
}

export const PureShoppingCartSidebar = (props: ShoppingCartSidebarProps) => props.customer ? (
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
        {props.project && (
          <tr>
            <td><strong>{translate('Project')}</strong></td>
            <td>{props.project.name}</td>
          </tr>
        )}
        <tr>
          <td className="text-lg">{translate('Total')}</td>
          <td className="text-lg">
            {defaultCurrency(props.total)}
          </td>
        </tr>
      </tbody>
    </table>

    {props.file && (
      <DownloadLink
        label={translate('Download order PDF file')}
        url={props.file}
        filename="marketplace-order.pdf"
        className="btn btn-outline btn-default"
      />
    )}
  </aside>
) : null;

const mapStateToProps = state => ({
  customer: getCustomer(state),
  project: getProject(state),
  total: getTotal(state),
});

export const ShoppingCartSidebar = connect(mapStateToProps)(PureShoppingCartSidebar);
