import { PlusMinusIcon } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { ENV } from '@waldur/core/config';
import { defaultCurrency, formatCurrency } from '@waldur/core/formatCurrency';
import { lazyComponent } from '@waldur/core/lazyComponent';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

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
  const dispatch = useDispatch();
  const onClick = useCallback(
    () =>
      dispatch(
        openModalDialog(EstimateUsageComponentDialog, {
          size: 'lg',
          resolve: {
            component: props.offeringComponent,
            period: props.period,
            hidePrices: props.hidePrices,
          },
        }),
      ),
    [dispatch, props],
  );

  const perPeriod = !props.period
    ? ''
    : props.period === 'annual'
      ? ' /year'
      : ' /mo';

  return (
    <FormTable.Item
      label={props.offeringComponent.name}
      tooltip={
        props.offeringComponent.limit_amount !== null && (
          // limit_period options: total, month, annual
          <>
            {props.offeringComponent.limit_period === 'total' &&
              translate('Total limit: {limit} {unit}', {
                limit: props.offeringComponent.limit_amount,
                unit: props.offeringComponent.measured_unit,
              })}
            {props.offeringComponent.limit_period === 'month' &&
              translate('Monthly limit: {limit} {unit}', {
                limit: props.offeringComponent.limit_amount,
                unit: props.offeringComponent.measured_unit,
              })}
            {props.offeringComponent.limit_period === 'annual' &&
              translate('Annual limit: {limit} {unit}', {
                limit: props.offeringComponent.limit_amount,
                unit: props.offeringComponent.measured_unit,
              })}
          </>
        )
      }
      description={
        translate('Cost') +
        ': ' +
        (props.offeringComponent.measured_unit
          ? translate('{price} per {unit}', {
              price: defaultCurrency(props.offeringComponent.price),
              unit: props.offeringComponent.measured_unit,
            })
          : defaultCurrency(props.offeringComponent.price))
      }
      value={translate('Usage based')}
      actions={
        !props.hidePrices && (
          <>
            <div>
              {translate('Total')}
              {': '}
              {formatCurrency(0, ENV.plugins.WALDUR_CORE.CURRENCY_NAME, 4)}
              {perPeriod}
            </div>
            <div className="estimate">
              <Button variant="link" onClick={onClick} className="p-0">
                <PlusMinusIcon size={16} weight="bold" className="me-2" />
                {translate('Calculate price')}
              </Button>
            </div>
          </>
        )
      }
    />
  );
};
