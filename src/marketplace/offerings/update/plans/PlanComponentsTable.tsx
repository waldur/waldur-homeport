import { InfoIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { OfferingComponent, ProviderPlanDetails } from 'waldur-js-client';

import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import {
  BillingTypeBadge,
  formatComponentCharge,
  isChargedOnPlanAmount,
} from '@/marketplace/common/billingTypes';
import { parseFloatOrNull } from '@/marketplace/common/utils';
import { resolvePlanComponents } from '@/marketplace/details/plan/effectiveComponents';
import { DASH_ESCAPE_CODE } from '@/table/constants';

interface OwnProps {
  row: ProviderPlanDetails;
  components: OfferingComponent[];
}

// A plan amount or price of 0 is a real value the provider needs to see, so it
// must not be collapsed into a dash the way renderFieldOrDash would.
const renderNumberOrDash = (value: number | null | undefined) =>
  value === null || value === undefined ? DASH_ESCAPE_CODE : value;

export const PlanComponentsTable: FC<OwnProps> = (props) => (
  <table className="table align-middle">
    <thead>
      <tr className="align-middle">
        <th>{translate('Name')}</th>
        <th>{translate('Billing type')}</th>
        <th>{translate('Amount')}</th>
        <th>{translate('Current price')}</th>
        <th>{translate('Price update next month')}</th>
        <th>{translate('Units')}</th>
      </tr>
    </thead>
    <tbody>
      {resolvePlanComponents(props.components, props.row).map((component) => {
        const price = parseFloatOrNull(props.row.prices[component.type]);
        // Only a plan-amount component has a meaningful amount here; for the
        // rest the quantity comes from usage or the customer's limit, and a
        // stored 0 would read as "none of it is billed".
        const amount = isChargedOnPlanAmount(component)
          ? props.row.quotas?.[component.type]
          : null;
        const charge = formatComponentCharge(
          component,
          amount,
          price,
          props.row.unit,
        );
        return (
          <tr key={component.type}>
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
            <td>
              <BillingTypeBadge component={component} />
            </td>
            <td>{renderNumberOrDash(amount)}</td>
            <td>
              {renderNumberOrDash(price)}
              {charge && <div className="text-muted small">{charge}</div>}
            </td>
            <td>
              {props.row.future_prices[component.type] !== null &&
              props.row.future_prices[component.type] !== undefined
                ? parseFloat(props.row.future_prices[component.type])
                : translate('No update')}
            </td>
            <td>{component.measured_unit}</td>
          </tr>
        );
      })}
    </tbody>
  </table>
);
