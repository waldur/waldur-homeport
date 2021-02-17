import React from 'react';

import { translate } from '@waldur/i18n';
import { OfferingLimits } from '@waldur/marketplace/offerings/store/types';
import { PriceField } from '@waldur/marketplace/resources/change-limits/PriceField';
import { Plan } from '@waldur/marketplace/types';
import { PriceTooltip } from '@waldur/price/PriceTooltip';

import { ComponentRow } from './ComponentRow';
import { StateProps } from './connector';

interface Props extends StateProps {
  plan: Plan;
  offeringLimits: OfferingLimits;
}

export const ChangeLimitsComponent: React.FC<Props> = (props) => (
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
          <th>{translate('Change')}</th>
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
          <td colSpan={5}>{translate('Total')}</td>
          {props.totalPeriods.map((price, index) => (
            <td key={index}>
              <PriceField
                price={price}
                changedPrice={props.changedTotalPeriods[index]}
              />
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  </div>
);
