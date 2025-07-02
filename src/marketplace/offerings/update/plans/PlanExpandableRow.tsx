import { InfoIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { OfferingComponent } from 'waldur-js-client';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { Plan } from '@waldur/marketplace/types';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';

interface OwnProps {
  row: Plan;
  components: OfferingComponent[];
}

export const PlanExpandableRow: FC<OwnProps> = (props) => {
  return (
    <ExpandableContainer>
      <div className="card card-table card-bordered">
        <div className="card-body">
          <table className="table align-middle">
            <thead>
              <tr className="align-middle">
                <th>{translate('Name')}</th>
                <th>{translate('Current price')}</th>
                <th>{translate('Price update next month')}</th>
                <th>{translate('Units')}</th>
              </tr>
            </thead>
            <tbody>
              {props.components.map((component, index) => (
                <tr key={index}>
                  <td>
                    {component.name}{' '}
                    <Tip
                      id={`tip-component-${props.row.name}-${component.name}`}
                      label={component.type}
                      placement="right"
                    >
                      <InfoIcon weight="bold" />
                    </Tip>
                  </td>
                  <td>{props.row.prices[component.type]}</td>
                  <td>
                    {props.row.future_prices[component.type] ??
                      translate('No update')}
                  </td>
                  <td>
                    <div className="form-control-static">
                      {component.measured_unit}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ExpandableContainer>
  );
};
