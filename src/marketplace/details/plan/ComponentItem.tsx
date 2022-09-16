import React from 'react';
import { useSelector } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { formatCurrency } from '@waldur/core/formatCurrency';
import { Tip } from '@waldur/core/Tooltip';
import { getActiveFixedPricePaymentProfile } from '@waldur/invoices/details/utils';
import { getCustomer } from '@waldur/workspace/selectors';

import { Component } from './types';

interface ComponentItemProps {
  offeringComponent: Component;
  className?: string;
}

export const ComponentItem: React.FC<ComponentItemProps> = (props) => {
  const customer = useSelector(getCustomer);
  const activeFixedPriceProfile =
    customer && getActiveFixedPricePaymentProfile(customer.payment_profiles);
  const tipLabel =
    props.offeringComponent.type +
    ' ' +
    props.offeringComponent.amount +
    ' ' +
    (props.offeringComponent.measured_unit || 'N/A');

  return (
    <tr>
      <td>
        <span>
          {props.offeringComponent.name}
          <Tip label={tipLabel} id="componentTooltip">
            {' '}
            <i className="fa fa-question-circle" />
          </Tip>
        </span>
      </td>
      {!activeFixedPriceProfile
        ? props.offeringComponent.prices.map((price, innerIndex) => (
            <td key={innerIndex}>
              {formatCurrency(price, ENV.plugins.WALDUR_CORE.CURRENCY_NAME, 3)}
            </td>
          ))
        : null}
    </tr>
  );
};
