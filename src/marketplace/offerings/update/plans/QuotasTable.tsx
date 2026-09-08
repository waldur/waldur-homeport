import { FC } from 'react';
import { Field, useField } from 'react-final-form';
import {
  OfferingComponent,
  ProviderPlanDetails as Plan,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import {
  BillingTypeBadge,
  formatComponentCharge,
} from '@/marketplace/common/billingTypes';
import {
  validateNonNegative,
  parseIntField,
  formatIntField,
  parseFloatOrNull,
} from '@/marketplace/common/utils';
import { DASH_ESCAPE_CODE } from '@/table/constants';

interface QuotasTableProps {
  components: OfferingComponent[];
  plan: Plan;
}

const QuotaRow: FC<{ component: OfferingComponent; plan: Plan }> = ({
  component,
  plan,
}) => {
  const price = parseFloatOrNull(plan.prices?.[component.type]);
  // Same `format` as the <Field> below, so the input and the charge line can
  // never disagree about a component the plan has no quota for: RFF's default
  // format hands back '' where formatIntField renders 0, which read as
  // "Amount 0 ... Charge —" on the same row.
  const { input } = useField(`quotas.${component.type}`, {
    subscription: { value: true },
    format: formatIntField,
  });
  const amount = parseFloatOrNull(input.value);
  const charge = formatComponentCharge(component, amount, price, plan.unit);

  return (
    <tr>
      <td>{component.name}</td>
      <td>
        <BillingTypeBadge component={component} />
      </td>
      <td>
        <Field
          component="input"
          min={0}
          className="form-control"
          name={`quotas.${component.type}`}
          type="number"
          validate={validateNonNegative}
          inputMode="numeric"
          parse={parseIntField}
          format={formatIntField}
        />
      </td>
      <td>{price === null ? DASH_ESCAPE_CODE : price}</td>
      <td>{charge || DASH_ESCAPE_CODE}</td>
      <td>{component.measured_unit}</td>
    </tr>
  );
};

export const QuotasTable: FC<QuotasTableProps> = (props) => (
  <table className="table table-borderless">
    <thead>
      <tr>
        <th>{translate('Name')}</th>
        <th>{translate('Billing type')}</th>
        <th>{translate('Amount')}</th>
        <th>{translate('Unit price')}</th>
        <th>{translate('Charge')}</th>
        <th>{translate('Units')}</th>
      </tr>
    </thead>
    <tbody>
      {props.components.map((component) => (
        <QuotaRow
          key={component.type}
          component={component}
          plan={props.plan}
        />
      ))}
    </tbody>
  </table>
);
