import { InvoiceCostItem, BillingUnit } from 'waldur-js-client';

import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';
import { getPlanUnitAbbr } from '@/marketplace/orders/utils';
import { ModalDialog } from '@/modal/ModalDialog';

export const CostBreakdownDialog = ({
  resolve: { items },
}: {
  resolve: { items: InvoiceCostItem[] };
}) => {
  return (
    <ModalDialog title={translate('Cost breakdown')}>
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
