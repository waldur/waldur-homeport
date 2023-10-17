import React from 'react';
import { useSelector } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { defaultCurrency, formatCurrency } from '@waldur/core/formatCurrency';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { getActiveFixedPricePaymentProfile } from '@waldur/invoices/details/utils';
import { getCustomer } from '@waldur/workspace/selectors';

import { Component, PlanPeriod } from './types';

interface ComponentRowProps {
  offeringComponent: Component;
  period?: PlanPeriod;
  activePriceIndex?: number;
  hidePrices?: boolean;
  hasX?: boolean;
  className?: string;
}

export const ComponentRow: React.FC<ComponentRowProps> = (props) => {
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
            <i className="fa fa-question-circle" />
          </Tip>
        </p>
      </td>
      <td className={props.className}>{props.children}</td>
      <td>
        <p>{props.offeringComponent.measured_unit || 'N/A'}</p>
      </td>
      {!activeFixedPriceProfile
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

export const ComponentRow2: React.FC<ComponentRowProps> = (props) => {
  const componentTotalPrice =
    props.offeringComponent.prices[props.activePriceIndex];

  const perPeriod = !props.period
    ? ''
    : props.period === 'annual'
    ? ' /year'
    : ' /mo';

  return (
    <tr>
      <th>
        {props.offeringComponent.name}
        <Tip
          label={props.offeringComponent.type}
          id={`componentTypeTooltip-${props.offeringComponent.type}`}
          className="mx-1"
        >
          {' '}
          <i className="fa fa-question-circle" />
        </Tip>
        <span className="fw-normal fst-italic">
          (
          {props.offeringComponent.measured_unit
            ? translate('{price} per {unit}', {
                price: defaultCurrency(props.offeringComponent.price),
                unit: props.offeringComponent.measured_unit,
              })
            : defaultCurrency(props.offeringComponent.price)}
          )
        </span>
      </th>
      <td>{props.hasX ? 'X' : ''}</td>
      <td className={props.className}>{props.children}</td>
      {!props.hidePrices ? (
        <>
          <td className="text-center" width="20px">
            =
          </td>
          <td className="estimate">
            {formatCurrency(
              componentTotalPrice,
              ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
              4,
            )}
            {perPeriod}
          </td>
        </>
      ) : null}
    </tr>
  );
};
