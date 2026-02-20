import { InvoiceCostItem, BillingUnit } from 'waldur-js-client';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import { getPlanUnitAbbr } from '@waldur/marketplace/orders/utils';
import { ModalDialog } from '@waldur/modal/ModalDialog';

export const CostBreakdownDialog = ({
  resolve: { items },
}: {
  resolve: { items: InvoiceCostItem[] };
}) => {
  return (
    <ModalDialog title={translate('Cost breakdown')} closeButton>
      <table className="table table-hover mb-0">
        <thead>
          <tr>
            <th>{translate('Name')}</th>
            <th className="text-end">{translate('Unit price')}</th>
            <th className="text-end">{translate('Quantity')}</th>
            <th className="text-end">{translate('Total')}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td className="text-end">
                {defaultCurrency(Number(item.unit_price))}
                {item.unit !== 'quantity' &&
                  getPlanUnitAbbr(item.unit as BillingUnit)}
              </td>
              <td className="text-end">{Number(item.quantity)}</td>
              <td className="text-end">{defaultCurrency(item.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ModalDialog>
  );
};
