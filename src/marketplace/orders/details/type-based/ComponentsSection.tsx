import { useMemo } from 'react';

import { ENV } from '@/core/config';
import { formatCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';
import { Component } from '@/marketplace/details/plan/types';
import { PriceTooltip } from '@/price/PriceTooltip';
import { renderFieldOrDash } from '@/table/utils';

import { DetailsTable } from './DetailsTable';

export const ComponentsSection = ({
  title,
  components,
  showQuantity,
  hidePrices,
}: {
  title: string;
  components: Component[];
  showQuantity?: boolean;
  hidePrices?: boolean;
}) => {
  if (!components.length) return null;

  const columns = [
    {
      title: translate('Component name'),
      render: ({ row }) => row.name,
    },
    {
      title: translate('Unit'),
      render: ({ row }) => renderFieldOrDash(row.measured_unit),
    },
    ...(showQuantity
      ? [
          {
            title: translate('Quantity'),
            render: ({ row }) => row.amount,
          },
        ]
      : []),
    ...(!hidePrices
      ? [
          {
            title: (
              <>
                {translate('Price per unit')}
                <PriceTooltip />
              </>
            ),
            render: ({ row }) =>
              formatCurrency(
                row.price,
                ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
                4,
              ),
          },
        ]
      : []),
    ...(!hidePrices && showQuantity
      ? [
          {
            title: translate('Subtotal'),
            render: ({ row }) =>
              formatCurrency(
                row.subTotal,
                ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
                4,
              ),
          },
        ]
      : []),
  ];

  return (
    <div className="mb-6">
      <DetailsTable rows={components} columns={columns} />
      <p className="text-muted mt-2 mb-0 fs-7">{title}</p>
    </div>
  );
};

export const useGroupedComponents = (components: Component[]) =>
  useMemo(() => {
    const fixed = components.filter((c) => c.billing_type === 'fixed');
    const usage = components.filter((c) => c.billing_type === 'usage');
    const initial = components.filter(
      (c) => c.billing_type === 'one' && !c.is_prepaid,
    );
    const prepaid = components.filter(
      (c) => c.billing_type === 'one' && c.is_prepaid,
    );
    const switchR = components.filter((c) => c.billing_type === 'few');
    const limited = components.filter((c) => c.billing_type === 'limit');
    const totalLimited = limited.filter((c) => c.limit_period === 'total');
    const otherLimited = limited.filter((c) => c.limit_period !== 'total');
    return {
      fixedRows: fixed,
      usageRows: usage,
      initialRows: initial,
      prepaidRows: prepaid,
      switchRows: switchR,
      totalLimitedRows: totalLimited,
      otherLimitedRows: otherLimited,
      hasPeriodicRows: fixed.length > 0 || otherLimited.length > 0,
      periodicComponents: [...fixed, ...otherLimited],
    };
  }, [components]);
