import { InvoiceCostItem, BillingUnit, Project } from 'waldur-js-client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';
import { getPlanUnitAbbr } from '@/marketplace/orders/utils';
import { ModalDialog } from '@/modal/ModalDialog';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';

export const CostBreakdownDialog = ({
  resolve: { items, project },
}: {
  resolve: { items: InvoiceCostItem[]; project: Project };
}) => {
  return (
    <ModalDialog
      title={translate('Cost breakdown')}
      subtitle={
        <ScopeSubtitle label={translate('Project name')} name={project.name} />
      }
    >
      <Table className="mb-0">
        <TableHeader>
          <TableRow>
            <TableHead>{translate('Name')}</TableHead>
            <TableHead className="text-end">
              {translate('Unit price')}
            </TableHead>
            <TableHead className="text-end">{translate('Quantity')}</TableHead>
            <TableHead className="text-end">{translate('Total')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.name}</TableCell>
              <TableCell className="text-end">
                {defaultCurrency(Number(item.unit_price))}
                {item.unit !== 'quantity' &&
                  getPlanUnitAbbr(item.unit as BillingUnit)}
              </TableCell>
              <TableCell className="text-end">
                {Number(item.quantity)}
              </TableCell>
              <TableCell className="text-end">
                {defaultCurrency(item.price)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ModalDialog>
  );
};
