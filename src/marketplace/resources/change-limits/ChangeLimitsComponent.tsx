import * as React from 'react';

import { defaultCurrency } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { OfferingLimits } from '@waldur/marketplace/offerings/store/types';
import { Plan } from '@waldur/marketplace/types';
import { PriceTooltip } from '@waldur/price/PriceTooltip';

import { ComponentRow } from './ComponentRow';
import { StateProps } from './connector';

interface Props extends StateProps {
  plan: Plan;
  offeringLimits: OfferingLimits;
}

export const ChangeLimitsComponent: React.FC<Props> = props => (
  <div>
    {props.plan ? (
      <p>
        <strong>{translate('Current plan')}</strong>: {props.plan.name}
      </p>
    ) : (
      <p>{translate('Resource does not have any plan.')}</p>
    )}
    <table className="table table-bordered">
      <thead>
        <tr>
          <th>{translate('Name')}</th>
          <th>{translate('Usage')}</th>
          <th>{translate('Current limit')}</th>
          <th>{translate('New limit')}</th>
          {props.periods.map((period, index) => (
            <th className="col-sm-1" key={index}>
              {period}
              <PriceTooltip />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {props.components.map((component, index) => (
          <ComponentRow
            key={index}
            component={component}
            limits={props.offeringLimits[component.type]}
          />
        ))}
        <tr>
          <td colSpan={4}>{translate('Total')}</td>
          {props.totalPeriods.map((price, index) => (
            <td key={index}>{defaultCurrency(price)}</td>
          ))}
        </tr>
      </tbody>
    </table>
  </div>
);
