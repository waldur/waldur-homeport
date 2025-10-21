import {
  BasePublicPlan,
  OrderDetails,
  PublicOfferingDetails,
} from 'waldur-js-client';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import { combinePrices } from '@waldur/marketplace/details/plan/utils';

export const OrderComponentsTable = ({
  order,
  offering,
}: {
  order: OrderDetails;
  offering: PublicOfferingDetails;
}) => {
  const plan: BasePublicPlan = offering.plans.find(
    (plan) => plan.uuid === order.plan_uuid,
  );
  const limits = order.limits;
  const prices = combinePrices(
    plan,
    limits,
    {},
    offering,
    order.attributes['end_date'],
  );
  if (prices.components.length === 0) {
    return null;
  }
  return (
    <table className="table table-row-bordered border-bottom mb-3">
      <thead>
        <tr>
          <th className="ps-1 fs-5">{translate('Component')}</th>
          <th className="ps-1 fs-5">{translate('Price')}</th>
          <th className="ps-1 fs-5">{translate('Quantity')}</th>
          <th className="ps-1 fs-5">{translate('Subtotal')}</th>
        </tr>
      </thead>
      <tbody>
        {prices.components
          .filter((component) => component.subTotal > 0)
          .map((component) => (
            <tr key={component.name}>
              <td className="ps-1 fs-5">{component.name}</td>
              <td className="ps-1 fs-5">{defaultCurrency(component.price)}</td>
              <td className="ps-1 fs-5">{component.amount}</td>
              <td className="ps-1 fs-5">
                {defaultCurrency(component.subTotal)}
              </td>
            </tr>
          ))}
        <tr>
          <td colSpan={3} className="text-end fw-bold fs-5 ps-1">
            {translate('Total')}:
          </td>
          <td className="fw-bold fs-5 ps-1">{defaultCurrency(prices.total)}</td>
        </tr>
      </tbody>
    </table>
  );
};
