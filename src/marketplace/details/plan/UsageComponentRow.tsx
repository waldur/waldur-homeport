import { PlusMinusIcon } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';

import { ENV } from '@/core/config';
import { defaultCurrency, formatCurrency } from '@/core/formatCurrency';
import { lazyComponent } from '@/core/lazyComponent';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

import { Component, PlanPeriod } from './types';

const EstimateUsageComponentDialog = lazyComponent(() =>
  import('./EstimateUsageComponentDialog').then((module) => ({
    default: module.EstimateUsageComponentDialog,
  })),
);

interface UsageComponentRowProps {
  offeringComponent: Component;
  period?: PlanPeriod;
  hidePrices?: boolean;
}

export const UsageComponentRow: FC<UsageComponentRowProps> = (props) => {
  const { openDialog } = useModal();
  const onClick = useCallback(
    () =>
      openDialog(EstimateUsageComponentDialog, {
        size: 'lg',
        resolve: {
          component: props.offeringComponent,
          period: props.period,
          hidePrices: props.hidePrices,
        },
      }),
    [props],
  );

  const perPeriod = !props.period
    ? ''
    : props.period === 'annual'
      ? ' /year'
      : ' /mo';

  const limitAmount = props.offeringComponent.limit_amount;
  const limitPeriod = props.offeringComponent.limit_period;
  const measuredUnit = props.offeringComponent.measured_unit;

  return (
    <FormTable.Item
      label={props.offeringComponent.name}
      tooltip={
        limitAmount !== null && (
          // limit_period options: total, month, quarterly, annual
          <>
            {limitPeriod === 'total'
              ? translate('Limit: {limit} {unit} total', {
                  limit: limitAmount,
                  unit: measuredUnit,
                })
              : limitPeriod === 'quarterly'
                ? translate('Limit: {limit} {unit} per quarter', {
                    limit: limitAmount,
                    unit: measuredUnit,
                  })
                : limitPeriod === 'annual'
                  ? translate('Limit: {limit} {unit} per year', {
                      limit: limitAmount,
                      unit: measuredUnit,
                    })
                  : translate('Limit: {limit} {unit} per month', {
                      limit: limitAmount,
                      unit: measuredUnit,
                    })}
          </>
        )
      }
      description={
        !props.hidePrices
          ? measuredUnit
            ? translate('Cost: {price} per {unit}', {
                price: defaultCurrency(props.offeringComponent.price),
                unit: measuredUnit,
              })
            : translate('Cost: {price}', {
                price: defaultCurrency(props.offeringComponent.price),
              })
          : undefined
      }
      value={translate('Usage based')}
      actions={
        !props.hidePrices && (
          <>
            <div>
              {translate('Total: {currency} {period}', {
                currency: formatCurrency(
                  0,
                  ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
                  4,
                ),
                period: perPeriod,
              })}
            </div>
            <div className="estimate">
              <ActionButton
                variant="link"
                action={onClick}
                className="p-0"
                iconNode={<PlusMinusIcon size={16} weight="bold" />}
                title={translate('Calculate price')}
              />
            </div>
          </>
        )
      }
    />
  );
};
