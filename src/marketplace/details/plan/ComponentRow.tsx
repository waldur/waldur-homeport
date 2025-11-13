import { QuestionIcon } from '@phosphor-icons/react';
import React, { PropsWithChildren } from 'react';
import { useSelector } from 'react-redux';

import { ENV } from '@waldur/core/config';
import { formatCurrency } from '@waldur/core/formatCurrency';
import { Tip } from '@waldur/core/Tooltip';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { getActiveFixedPricePaymentProfile } from '@waldur/invoices/details/utils';
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
    <tr>
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
        <p>{props.offeringComponent.measured_unit || 'N/A'}</p>
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
      ? ' /year'
      : ' /mo';

  return (
    <FormTable.Item
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
            {translate('Total')}
            {': '}
            {formatCurrency(
              componentTotalPrice,
              ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
              4,
            )}
            {perPeriod}
          </>
        )
      }
    />
  );
};
