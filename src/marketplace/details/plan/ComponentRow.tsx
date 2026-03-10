import { QuestionIcon } from '@phosphor-icons/react';
import React, { PropsWithChildren } from 'react';
import { useSelector } from 'react-redux';
import { LimitPeriodEnum } from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import { formatCurrency } from '@waldur/core/formatCurrency';
import { Tip } from '@waldur/core/Tooltip';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { getActiveFixedPricePaymentProfile } from '@waldur/invoices/details/utils';
import { renderFieldOrDash } from '@waldur/table/utils';
import { getCustomer } from '@waldur/workspace/selectors';

import { ComponentCost } from './ComponentCost';
import { Component, PlanPeriod } from './types';

interface ComponentRowProps {
  offeringComponent: Component;
  period?: PlanPeriod;
  activePriceIndex?: number;
  hidePrices?: boolean;
  hasX?: boolean;
  className?: string;
}

export const ComponentRow: React.FC<PropsWithChildren<ComponentRowProps>> = (
  props,
) => {
  const customer = useSelector(getCustomer);
  const activeFixedPriceProfile =
    customer && getActiveFixedPricePaymentProfile(customer.payment_profiles);

  return (
    <tr data-testid={`row-${props.offeringComponent.type}`}>
      <td>
        <p>
          {props.offeringComponent.name}
          <Tip label={props.offeringComponent.type} id="componentTypeTooltip">
            {' '}
            <QuestionIcon weight="bold" />
          </Tip>
        </p>
      </td>
      <td className={props.className}>{props.children}</td>
      <td>
        <p>{renderFieldOrDash(props.offeringComponent.measured_unit)}</p>
      </td>
      {!activeFixedPriceProfile && !props.hidePrices
        ? props.offeringComponent.prices.map((price, innerIndex) => (
            <td key={innerIndex}>
              <p>
                {formatCurrency(
                  price,
                  ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
                  3,
                )}
              </p>
            </td>
          ))
        : null}
    </tr>
  );
};

export const ComponentRow2: React.FC<PropsWithChildren<ComponentRowProps>> = (
  props,
) => {
  const componentTotalPrice =
    props.offeringComponent.prices[props.activePriceIndex];

  const perPeriod = !props.period
    ? ''
    : props.period === 'annual'
      ? translate(' /year')
      : translate(' /mo');

  const limitPeriod = props.offeringComponent.limit_period as LimitPeriodEnum;
  const perLimitPeriod =
    limitPeriod === 'annual'
      ? translate(' /year')
      : limitPeriod === 'quarterly'
        ? translate(' /quarter')
        : '';

  return (
    <FormTable.Item
      htmlFor={`limit-${props.offeringComponent.type}`}
      data-testid={`row-${props.offeringComponent.type}`}
      label={props.offeringComponent.name}
      description={
        props.hidePrices ? null : (
          <ComponentCost component={props.offeringComponent} />
        )
      }
      value={props.children}
      actions={
        !props.hidePrices && (
          <>
            <span className="d-block">
              {translate('Total')}
              {': '}
              {formatCurrency(
                perLimitPeriod
                  ? props.offeringComponent.subTotal
                  : componentTotalPrice,
                ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
                4,
              )}
              {perLimitPeriod || perPeriod}
            </span>
            {perLimitPeriod ? (
              <span className="fs-7">
                {formatCurrency(
                  componentTotalPrice,
                  ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
                  4,
                )}
                {perPeriod}
              </span>
            ) : null}
          </>
        )
      }
    />
  );
};
