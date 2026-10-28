import { DateTime } from 'luxon';
import { FunctionComponent } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

import { formatDate } from '@/core/dateUtils';
import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';
import { getActiveFixedPricePaymentProfile } from '@/invoices/details/utils';
import {
  formatMonthCount,
  getPrepaidDurationMonths,
} from '@/marketplace/common/prepaidTotalDisplay';
import { PriceTooltip } from '@/price/PriceTooltip';
import { useCustomer } from '@/workspace/hooks';

import { ComponentEditRow } from './ComponentEditRow';
import { ComponentRow } from './ComponentRow';
import { LimitlessComponentsTable } from './LimitlessComponentsTable';
import { TotalLimitComponentsTable } from './TotalLimitComponentsTable';
import { Component, PlanDetailsTableProps } from './types';

const HeaderRow = (props: {
  periods?: string[];
  concealBillingInfo?: boolean;
}) => (
  <TableRow>
    <TableHead style={{ width: '5%' }}>{translate('Component name')}</TableHead>
    <TableHead style={{ width: '5%' }}>{translate('Quantity')}</TableHead>
    <TableHead style={{ width: '5%' }}>{translate('Unit')}</TableHead>
    {!props.concealBillingInfo &&
      props.periods.map((period, index) => (
        <TableHead className="sm:w-1/12" key={index}>
          {period}
          <PriceTooltip />
        </TableHead>
      ))}
  </TableRow>
);

const FixedRows = (props: {
  components: Component[];
  concealBillingInfo?: boolean;
}) => (
  <>
    {props.components.map((component, index) => (
      <ComponentRow
        key={index}
        offeringComponent={component}
        hidePrices={props.concealBillingInfo}
      >
        {component.amount}
      </ComponentRow>
    ))}
  </>
);

const UsageRows = (props: {
  components: Component[];
  viewMode: boolean;
  concealBillingInfo?: boolean;
}) =>
  props.viewMode ? (
    <FixedRows
      components={props.components}
      concealBillingInfo={props.concealBillingInfo}
    />
  ) : (
    <>
      {props.components.map((component, index) => (
        <ComponentEditRow key={index} component={component} />
      ))}
    </>
  );

export const PureDetailsTable: FunctionComponent<PlanDetailsTableProps> = (
  props,
) => {
  const customer = useCustomer();

  if (props.components.length === 0) {
    return null;
  }

  const activeFixedPriceProfile =
    customer && getActiveFixedPricePaymentProfile(customer.payment_profiles);

  const fixedRows = props.components.filter(
    (component) => component.billing_type === 'fixed',
  );
  const usageRows = props.components.filter(
    (component) => component.billing_type === 'usage',
  );
  const initialRows = props.components.filter(
    (component) => component.billing_type === 'one' && !component.is_prepaid,
  );
  const prepaidRows = props.components.filter(
    (component) => component.billing_type === 'one' && component.is_prepaid,
  );
  const prepaidTotal = prepaidRows.reduce(
    (subTotal, component) => subTotal + component.subTotal,
    0,
  );
  const switchRows = props.components.filter(
    (component) => component.billing_type === 'few',
  );
  const limitedRows = props.components.filter(
    (component) => component.billing_type === 'limit',
  );
  const totalLimitedRows = limitedRows.filter(
    (component) => component.limit_period === 'total',
  );
  const otherLimitedRows = limitedRows.filter(
    (component) => component.limit_period !== 'total',
  );
  const totalLimitTotal = totalLimitedRows.reduce(
    (subTotal, component) => subTotal + component.subTotal,
    0,
  );
  const hasExtraRows = fixedRows.length > 0 || otherLimitedRows.length > 0;

  return (
    <div className={props.formGroupClassName}>
      <div className={props.columnClassName}>
        {hasExtraRows && (
          <div className="mb-3">
            <Table density="normal">
              <TableHeader>
                <HeaderRow
                  periods={!activeFixedPriceProfile ? props.periods : []}
                  concealBillingInfo={props.concealBillingInfo}
                />
              </TableHeader>
              <TableBody>
                {fixedRows.length > 0 && (
                  <FixedRows
                    components={fixedRows}
                    concealBillingInfo={props.concealBillingInfo}
                  />
                )}
                {!props.viewMode &&
                  otherLimitedRows.length > 0 &&
                  fixedRows.length > 0 && (
                    <TableRow className="text-center">
                      <TableCell colSpan={3 + props.periods.length}>
                        {translate(
                          'Please enter desired values in the rows below:',
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                {otherLimitedRows.length > 0 && (
                  <UsageRows
                    components={otherLimitedRows}
                    viewMode={props.viewMode}
                    concealBillingInfo={props.concealBillingInfo}
                  />
                )}
                {!activeFixedPriceProfile && !props.concealBillingInfo ? (
                  <TableRow>
                    <TableCell colSpan={3} className="font-bold">
                      {translate('Total')}
                    </TableCell>
                    {props.totalPeriods.map((price, index) => (
                      <TableCell key={index} className="font-bold">
                        {defaultCurrency(price)}
                      </TableCell>
                    ))}
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        )}
        {usageRows.length > 0 && (
          <>
            <LimitlessComponentsTable
              components={usageRows}
              concealBillingInfo={props.concealBillingInfo}
            />
            <p className="text-quaternary mt-1.5 mb-3 text-xs">
              {hasExtraRows
                ? translate(
                    'Additionally service provider can charge for usage of the following components',
                  )
                : translate(
                    'Service provider can charge for usage of the following components',
                  )}
            </p>
          </>
        )}
        {totalLimitedRows.length > 0 && (
          <>
            <TotalLimitComponentsTable
              components={totalLimitedRows}
              total={totalLimitTotal}
              viewMode={props.viewMode}
              hidePrices={props.concealBillingInfo}
            />
            <p className="text-quaternary mt-1.5 mb-3 text-xs">
              {translate(
                'Fee applied according to the maximum value reported by service provider over the whole active state of resource.',
              )}
            </p>
          </>
        )}
        {initialRows.length > 0 && (
          <>
            <LimitlessComponentsTable
              components={initialRows}
              concealBillingInfo={props.concealBillingInfo}
            />
            <p className="text-quaternary mt-1.5 mb-3 text-xs">
              {translate('A one-time fee applied on activation.')}
            </p>
          </>
        )}
        {prepaidRows.length > 0 && (
          <>
            <TotalLimitComponentsTable
              components={prepaidRows}
              total={prepaidTotal}
              viewMode={true}
              hidePrices={props.concealBillingInfo}
            />
            <p className="text-quaternary mt-1.5 mb-3 text-xs">
              {props.startDate && props.endDate
                ? (() => {
                    // Counted as the period is billed, like the quantities
                    // above: a partial month rounds up, both in the period
                    // and in what is left of it. Nothing is left once it ends.
                    const totalMonths = getPrepaidDurationMonths(
                      props.startDate,
                      props.endDate,
                    );
                    const today = DateTime.now().toISODate();
                    const remainingMonths =
                      DateTime.fromISO(props.endDate) > DateTime.fromISO(today)
                        ? getPrepaidDurationMonths(today, props.endDate)
                        : 0;
                    return translate(
                      'Prepaid for {duration} ({startDate} — {endDate}). {remaining} remaining.',
                      {
                        duration: formatMonthCount(totalMonths),
                        startDate: formatDate(props.startDate),
                        endDate: formatDate(props.endDate),
                        remaining: formatMonthCount(remainingMonths),
                      },
                    );
                  })()
                : translate(
                    'Prepaid fee applied on activation based on ordered quantity and duration.',
                  )}
            </p>
          </>
        )}
        {switchRows.length > 0 && (
          <>
            <LimitlessComponentsTable
              components={switchRows}
              concealBillingInfo={props.concealBillingInfo}
            />
            <p className="text-quaternary mt-1.5 mb-3 text-xs">
              {translate('Fee applied each time this plan is activated.')}
            </p>
          </>
        )}
      </div>
    </div>
  );
};
