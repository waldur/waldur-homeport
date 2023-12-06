import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { getActiveFixedPricePaymentProfile } from '@waldur/invoices/details/utils';
import { getCustomer, getProject } from '@waldur/workspace/selectors';

import './ShoppingCartSidebar.scss';
import { getTotal } from './store/selectors';

interface ShoppingCartSidebarProps {
  cost?: number;
  file?: string;
}

export const ShoppingCartSidebar: FunctionComponent<ShoppingCartSidebarProps> =
  (props) => {
    const project = useSelector(getProject);
    const customer = useSelector(getCustomer);
    const computedTotal = useSelector(getTotal);
    const total = props.cost || computedTotal;
    if (!customer) {
      return null;
    }
    return (
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
              <td>{customer.name}</td>
            </tr>
            {project && (
              <tr>
                <td>
                  <strong>{translate('Project')}</strong>
                </td>
                <td>{project.name}</td>
              </tr>
            )}
            {!getActiveFixedPricePaymentProfile(customer.payment_profiles) &&
            !isFeatureVisible('marketplace.conceal_prices') ? (
              <tr>
                <td className="text-lg">{translate('Total')}</td>
                <td className="text-lg">{defaultCurrency(total)}</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </aside>
    );
  };
