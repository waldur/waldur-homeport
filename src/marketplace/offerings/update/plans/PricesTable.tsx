import { FC } from 'react';
import { Field } from 'react-final-form';
import {
  OfferingComponent,
  ProviderPlanDetails as Plan,
} from 'waldur-js-client';

import { composeValidators, required } from '@/core/validators';
import { NumberField } from '@/form';
import { translate } from '@/i18n';
import { BillingTypeBadge } from '@/marketplace/common/billingTypes';
import { validateNonNegative } from '@/marketplace/common/utils';

interface PricesTableProps {
  components: OfferingComponent[];
  /**
   * The plan being repriced. Absent while a plan is being created: there is no
   * current price to sit beside the input, and a component left blank is
   * simply one the provider has not priced yet.
   */
  plan?: Plan;
  /** Where in the form the inputs write. */
  fieldName?: string;
  /** Whether a blank field blocks submission. Defaults to editing a plan. */
  requirePrice?: boolean;
}

const parseInput = (value) => {
  if (value === '' || value === undefined || value === null) return undefined;
  const num = parseFloat(value);
  return isNaN(num) ? value : num;
};

// Exact, not currency-formatted: the shared formatter rounds above 0.05 and
// would contradict the New price input beside it.
const formatPrice = (value) => {
  if (value === undefined || value === null || value === '') return '0';
  const num = parseFloat(value);
  return isNaN(num) ? String(value) : String(num);
};

// Which kind of table block this is, so nobody wraps it again:
//
//   - A table alone in a block is borderless -- the block is the frame, a card
//     with a title. The Plans tab is that one: `Table` draws the card.
//   - A table sharing its block with other UI carries a border, as the
//     separator between the information types. This grid is that one: it sits
//     under a heading and a toggle, above an alert.
//
// The border comes from `.modal .table-responsive` (which also rounds it), so
// a Card, a wrapper div or a border utility here would be a second box.
export const PricesTable: FC<PricesTableProps> = ({
  components,
  plan,
  fieldName = 'new_prices',
  requirePrice = Boolean(plan),
}) => (
  <div className="table-responsive">
    <table className="table table-row-bordered align-middle">
      <thead>
        {/* Header cells are bottom-aligned by default. */}
        <tr className="align-middle">
          <th>{translate('Name')}</th>
          <th>{translate('Billing type')}</th>
          {plan && <th>{translate('Current price')}</th>}
          <th>{plan ? translate('New price') : translate('Price')}</th>
          <th>{translate('Units')}</th>
        </tr>
      </thead>
      <tbody>
        {components.map((component: OfferingComponent) => (
          <tr key={component.type}>
            <td>{component.name}</td>
            <td>
              <BillingTypeBadge component={component} />
            </td>
            {plan && <td>{formatPrice(plan.prices[component.type])}</td>}
            <td>
              {/* Render prop, not component={NumberField}: a cell in
                        this grid wants the control alone, without the label
                        and description a NumberGroup would wrap it in. */}
              <Field
                name={`${fieldName}.${component.type}`}
                // An omitted component is priced at 0 by the backend, so
                // on a plan that is already charging something a blank
                // field must block submission instead of silently zeroing
                // it. A plan being created charges nothing yet: blank
                // there means "not priced", which the dialog warns about
                // rather than refuses.
                validate={
                  requirePrice
                    ? composeValidators(required, validateNonNegative)
                    : validateNonNegative
                }
                parse={parseInput}
              >
                {({ input, meta }) => (
                  <NumberField
                    input={input}
                    meta={meta}
                    min={0}
                    step="0.0000001"
                    showSteppers={false}
                    // The input sits alone in its cell, so nothing else names
                    // it: without this every row reads as the same blank field.
                    aria-label={translate('Price of {component}', {
                      component: component.name,
                    })}
                  />
                )}
              </Field>
            </td>
            <td>{component.measured_unit}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
