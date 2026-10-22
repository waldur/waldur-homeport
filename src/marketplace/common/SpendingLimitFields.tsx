import { get } from 'lodash-es';
import { FC } from 'react';
import { Field, useFormState } from 'react-final-form';
import { OfferingComponent } from 'waldur-js-client';

import { FieldError } from '@/form';
import FormTable from '@/form/FormTable';
import { BaseInputField } from '@/form/InputField';
import { translate } from '@/i18n';

import {
  formatSpendingAmount,
  getOfferedPeriods,
  getPeriodBounds,
  getSpendingLimitOrderErrors,
  getSpendingLimitLabel,
  getSpendingLimitResetText,
  isEmptyAmount,
  isHeldAmount,
  SpendingLimitPeriod,
  validateSpendingLimitAmount,
} from './spendingLimits';

type CappedComponent = Pick<
  OfferingComponent,
  'type' | 'name' | 'measured_unit' | 'spending_limit_periods'
>;

const getSpendingLimitFieldId = (
  componentType: string,
  period: SpendingLimitPeriod,
) => `spending-limit-${componentType}-${period}`;

const getErrorId = (componentType: string, period: SpendingLimitPeriod) =>
  `${getSpendingLimitFieldId(componentType, period)}-error`;

const makeValidator =
  (
    name: string,
    component: CappedComponent,
    period: SpendingLimitPeriod,
    maximum?: number | null,
    positive?: boolean,
  ) =>
  (value, allValues, meta?: { initial?: unknown }) =>
    validateSpendingLimitAmount(value, maximum, {
      positive,
      held: isHeldAmount(value, meta?.initial),
    }) ||
    getSpendingLimitOrderErrors(get(allValues, [name, component.type]))[period];

// Kept as typed: the payload formatter turns the text into a number, so a
// value such as "1." stays editable instead of snapping back.
const parseAmount = (value) => (value === '' ? undefined : value);

const PeriodInput: FC<{
  name: string;
  component: CappedComponent;
  period: SpendingLimitPeriod;
  disabled?: boolean;
  positive?: boolean;
}> = ({ name, component, period, disabled, positive }) => {
  const maximum = getPeriodBounds(component, period).maximum;
  const id = getSpendingLimitFieldId(component.type, period);
  return (
    <Field
      name={`${name}.${component.type}.${period}`}
      parse={parseAmount}
      validate={makeValidator(name, component, period, maximum, positive)}
      render={({ input, meta }) => {
        // Shown on first change, not only on blur: Submit is disabled as
        // you type, and the reason must be visible by then. An ordering
        // error comes from typing in another period's field, so it is shown
        // on this one whether or not it was touched. A stored limit may fail
        // too (the provider lowered the maximum since), so a pre-filled value
        // shows its error at once.
        const isOrderError =
          Boolean(meta.error) &&
          !validateSpendingLimitAmount(input.value, maximum, {
            positive,
            held: isHeldAmount(input.value, meta.initial),
          });
        const isStoredValue = !meta.modified && !isEmptyAmount(meta.initial);
        const error =
          meta.modified || meta.touched || isOrderError || isStoredValue
            ? meta.error
            : undefined;
        return (
          <div>
            <BaseInputField
              id={id}
              name={input.name}
              type="number"
              min={0}
              max={maximum ?? undefined}
              // A held amount with more decimals must not trip the
              // browser's own step check, which would block the submit.
              step={isHeldAmount(input.value, meta.initial) ? 'any' : '0.01'}
              placeholder={translate('No limit')}
              containerClassName="mw-200px"
              aria-invalid={Boolean(error)}
              aria-describedby={
                error ? getErrorId(component.type, period) : undefined
              }
              isInvalid={Boolean(error)}
              disabled={disabled}
              value={input.value ?? ''}
              onChange={(e) => input.onChange(e.target.value)}
              onBlur={input.onBlur}
              onFocus={input.onFocus}
              end={component.measured_unit || undefined}
            />
            <FieldError id={getErrorId(component.type, period)} error={error} />
          </div>
        );
      }}
    />
  );
};

const ComponentSubmitError: FC<{ name: string; componentType: string }> = ({
  name,
  componentType,
}) => {
  const { submitErrors } = useFormState({
    subscription: { submitErrors: true },
  });
  const error = get(submitErrors, [name, componentType]);
  // A field-level error object is shown by its field; the backend reports
  // spending limit errors per component, as a list of messages.
  return typeof error === 'string' || Array.isArray(error) ? (
    <FieldError error={error} />
  ) : null;
};

/**
 * One optional amount per offered period of each component, with the time the
 * period resets beside it. Values are written to `<name>.<type>.<period>`;
 * `formatSpendingLimits` turns them into the `spending_limits` payload.
 */
export const SpendingLimitFields: FC<{
  components: CappedComponent[];
  name?: string;
  disabled?: boolean;
  // Refuse a limit of 0, as an API key's limits do.
  positive?: boolean;
}> = ({ components, name = 'spending_limits', disabled, positive }) => (
  <>
    {components.map((component) => (
      <div
        key={component.type}
        className="mb-5 last:mb-0"
        data-testid={`spending-limits-${component.type}`}
      >
        {components.length > 1 && (
          <h6 className="mb-2 text-sm font-medium text-primary">
            {component.name}
          </h6>
        )}
        <FormTable className="gy-3">
          {getOfferedPeriods(component).map((period) => {
            const maximum = getPeriodBounds(component, period).maximum;
            return (
              <FormTable.Item
                key={period}
                label={getSpendingLimitLabel(period)}
                // The reset goes under the label, where it wraps: in the
                // actions column it never wraps, and the quarter's widens the
                // table past a dialog, squeezing every input to its unit.
                description={
                  <>
                    {maximum !== null && maximum !== undefined && (
                      <>
                        <span>
                          {translate('Up to {maximum}', {
                            maximum: formatSpendingAmount(maximum),
                          })}
                        </span>
                        {' · '}
                      </>
                    )}
                    <span>{getSpendingLimitResetText(period)}</span>
                  </>
                }
                value={
                  <PeriodInput
                    name={name}
                    component={component}
                    period={period}
                    disabled={disabled}
                    positive={positive}
                  />
                }
              />
            );
          })}
        </FormTable>
        <ComponentSubmitError name={name} componentType={component.type} />
      </div>
    ))}
  </>
);
