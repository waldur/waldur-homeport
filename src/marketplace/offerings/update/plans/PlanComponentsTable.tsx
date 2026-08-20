import { InfoIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { OfferingComponent, ProviderPlanDetails } from 'waldur-js-client';

import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';

interface OwnProps {
  row: ProviderPlanDetails;
  components: OfferingComponent[];
}

export const PlanComponentsTable: FC<OwnProps> = (props) => (
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
          <td>{parseFloat(props.row.prices[component.type])}</td>
          <td>
            {props.row.future_prices[component.type] !== null &&
            props.row.future_prices[component.type] !== undefined
              ? parseFloat(props.row.future_prices[component.type])
              : translate('No update')}
          </td>
          <td>
            <div className="form-control-static">{component.measured_unit}</div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);
