import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from '@phosphor-icons/react';
import { FunctionComponent, useMemo } from 'react';

import {
  Card,
  CardContent,
  PropertyItem,
  PropertyList,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from 'waldur-ui';

import { parseDate } from '@/core/dateUtils';
import { defaultCurrency } from '@/core/formatCurrency';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { isAccountingMode } from '@/invoices/accountingMode';
import { propVal } from '@/property/propertyFields';
import { Customer } from '@/workspace/types';

import { groupInvoiceItems, isOpenInvoice } from '../details/utils';
import { Invoice } from '../types';
import { formatPeriod } from '../utils';

import { EstimatedCost } from './EstimatedCost';

interface MonthOverviewProps {
  invoice: Pick<
    Invoice,
    | 'uuid'
    | 'state'
    | 'month'
    | 'year'
    | 'invoice_date'
    | 'items'
    | 'price'
    | 'tax'
    | 'total'
  >;
  customer: Customer;
  costTrend?: -1 | 0 | 1;
}

const OverviewItemTr = ({ title, value }) => {
  return (
    <TableRow divided={false} hoverable={false}>
      <TableCell className="text-[length:inherit] text-inherit underline w-full px-0 py-2.5">
        {title}
      </TableCell>
      <TableCell className="text-[length:inherit] text-quaternary whitespace-nowrap p-0">
        {value}
      </TableCell>
    </TableRow>
  );
};

export const MonthOverview: FunctionComponent<MonthOverviewProps> = ({
  invoice,
  customer,
  costTrend,
}) => {
  const isCurrentMonth = isOpenInvoice(invoice) && !invoice.invoice_date;
  const accountingMode = isAccountingMode();
  const maxProjectsShowCount = isCurrentMonth && !accountingMode ? 4 : 5;

  const projects = useMemo(() => {
    if (invoice) {
      return groupInvoiceItems(invoice.items);
    }
    return [];
  }, [invoice]);

  const showTotalSection =
    !isCurrentMonth &&
    projects &&
    projects.length > 1 &&
    Number(invoice.tax) > 0;

  const date = useMemo(() => {
    if (invoice) {
      return parseDate(
        formatPeriod({ year: invoice.year, month: invoice.month }),
      ).toFormat('LLLL yyyy');
    }
  }, [invoice]);

  if (!invoice) {
    return null;
  }

  return (
    <Card bordered className="h-full">
      <CardContent>
        <div className="grid grid-cols-2 gap-x-5 h-full">
          <div>
            {isCurrentMonth && !accountingMode ? (
              <div className="flex items-center">
                <div className="text-start">
                  <EstimatedCost />
                  <h4 className="mb-3">{date}</h4>
                </div>
                <span className="text-primary ms-3 inline-flex items-center">
                  {costTrend === -1 ? (
                    <ArrowDownIcon size={20} weight="bold" />
                  ) : costTrend === 1 ? (
                    <ArrowUpIcon size={20} weight="bold" />
                  ) : (
                    <MinusIcon size={20} weight="bold" />
                  )}
                </span>
              </div>
            ) : (
              <h2 className="mb-5">{date}</h2>
            )}
            <Table scrollable={false} className="text-xs">
              <TableBody>
                {projects.slice(0, maxProjectsShowCount).map((project) => (
                  <OverviewItemTr
                    key={project.resource_uuid}
                    title={project.resource_name}
                    value={defaultCurrency(project.total)}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
          <div>
            <div className="flex flex-col justify-between items-end h-full">
              <div>
                {showTotalSection && (
                  <PropertyList
                    variant="compact"
                    className="font-medium text-xs w-3/4"
                    labelClass="underline"
                    valueClass="text-quaternary"
                  >
                    {!accountingMode && (
                      <PropertyItem
                        label={translate('VAT')}
                        value={propVal.currency(invoice.tax)}
                      />
                    )}
                    <PropertyItem
                      label={translate('Subtotal')}
                      value={propVal.currency(invoice.price)}
                    />
                    <PropertyItem
                      label={translate('Total')}
                      value={propVal.currency(invoice.total)}
                    />
                  </PropertyList>
                )}
              </div>
              <div>
                <Link
                  state="billingDetails"
                  params={{
                    uuid: customer.uuid,
                    invoice_uuid: invoice.uuid,
                  }}
                  buttonVariant="tertiary"
                  buttonSize="sm"
                >
                  {translate('Details')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
