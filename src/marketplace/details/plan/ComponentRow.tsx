import React from 'react';
import { useSelector } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { formatCurrency } from '@waldur/core/formatCurrency';
import { Tip } from '@waldur/core/Tooltip';
import { getActiveFixedPricePaymentProfile } from '@waldur/invoices/details/utils';
import { getCustomer } from '@waldur/workspace/selectors';

import { Component } from './types';

interface ComponentRowProps {
  offeringComponent: Component;
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
