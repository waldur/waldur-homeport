import { FunctionComponent } from 'react';
import { connect } from 'react-redux';

import { DownloadLink } from '@waldur/core/DownloadLink';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import { getActiveFixedPricePaymentProfile } from '@waldur/invoices/details/utils';
import { RootState } from '@waldur/store/reducers';
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

export const PureShoppingCartSidebar: FunctionComponent<ShoppingCartSidebarProps> = (
  props,
) =>
  props.customer ? (
    <aside className="shopping-cart-sidebar">
      <div className="shopping-cart-sidebar-title">
        {translate('Order Summary')}
      </div>
      <table className="table">
        <tbody>
          <tr>
            <td>
              <strong>{translate('Invoiced to')}</strong>
            </td>
            <td>{props.customer.name}</td>
          </tr>
          {props.project && (
            <tr>
              <td>
                <strong>{translate('Project')}</strong>
              </td>
              <td>{props.project.name}</td>
            </tr>
          )}
          {!getActiveFixedPricePaymentProfile(
            props.customer.payment_profiles,
          ) ? (
            <tr>
              <td className="text-lg">{translate('Total')}</td>
              <td className="text-lg">{defaultCurrency(props.total)}</td>
            </tr>
          ) : null}
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

const mapStateToProps = (state: RootState) => ({
  customer: getCustomer(state),
  project: getProject(state),
  total: getTotal(state),
});

export const ShoppingCartSidebar = connect(mapStateToProps)(
  PureShoppingCartSidebar,
);
