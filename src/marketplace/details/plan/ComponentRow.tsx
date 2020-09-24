import * as React from 'react';
import { useSelector } from 'react-redux';

import { ENV, formatCurrency } from '@waldur/core/services';
import { Tooltip } from '@waldur/core/Tooltip';
import { getActiveFixedPricePaymentProfile } from '@waldur/invoices/details/utils';
import { getCustomer } from '@waldur/workspace/selectors';

import { Component } from './types';

interface Props {
  offeringComponent: Component;
  className?: string;
}

export const ComponentRow: React.FC<Props> = (props) => {
  const customer = useSelector(getCustomer);
  const activeFixedPriceProfile = getActiveFixedPricePaymentProfile(
    customer.payment_profiles,
  );

  return (
    <tr>
      <td>
        <p className="form-control-static">
          {props.offeringComponent.name}
          <Tooltip
            label={props.offeringComponent.type}
            id="componentTypeTooltip"
          >
            {' '}
            <i className="fa fa-question-circle" />
          </Tooltip>
        </p>
      </td>
      <td className={props.className}>{props.children}</td>
      <td>
        <p className="form-control-static">
          {props.offeringComponent.measured_unit || 'N/A'}
        </p>
      </td>
      {!activeFixedPriceProfile
        ? props.offeringComponent.prices.map((price, innerIndex) => (
            <td key={innerIndex}>
              <p className="form-control-static">
                {formatCurrency(price, ENV.currency, 3)}
              </p>
            </td>
          ))
        : null}
    </tr>
  );
};
