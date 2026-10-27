import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Field, useFormState } from 'react-final-form';

import { Checkbox } from 'waldur-ui';

import { BooleanGroup, FieldError, NumberGroup } from '@/form';
import { translate } from '@/i18n';
import {
  ComponentPeriodsFormValues,
  DAILY_REPORTED_PERIODS,
  getComponentDefaults,
  getSpendingLimitOrderErrors,
  getSpendingLimitPeriodLabel,
  isEmptyAmount,
  SPENDING_LIMIT_PERIODS,
  SpendingLimitPeriod,
  validateSpendingLimitAmount,
} from '@/marketplace/common/spendingLimits';

interface Values {
  spending_limits_enabled?: boolean;
  spending_limit_periods?: ComponentPeriodsFormValues;
}

const getPeriods = (allValues: Values) =>
  allValues?.spending_limit_periods || {};

const validateDefault =
  (period: SpendingLimitPeriod) => (value, allValues: Values) => {
    const error = validateSpendingLimitAmount(value);
    if (error) {
      return error;
    }
    const maximum = getPeriods(allValues)[period]?.maximum;
    if (
      !isEmptyAmount(value) &&
      !isEmptyAmount(maximum) &&
      Number(value) > Number(maximum)
    ) {
      return translate('The default must not exceed the maximum.');
    }
    return getSpendingLimitOrderErrors(
      getComponentDefaults(getPeriods(allValues)),
    )[period];
  };

const validateMaximum = (value) => validateSpendingLimitAmount(value);

const getNoPeriodError = () =>
  translate('Choose at least one period customers can set a limit for.');

// Keeps Save disabled while limits are switched on with no period ticked,
// which the API would store as "customers cannot set limits".
const validateEnabled = (value, allValues: Values) => {
  if (!value) {
    return undefined;
  }
  const periods = getPeriods(allValues);
  return SPENDING_LIMIT_PERIODS.some((period) => periods[period]?.enabled)
    ? undefined
    : getNoPeriodError();
};

const PeriodRow: FC<{ period: SpendingLimitPeriod; enabled: boolean }> = ({
  period,
  enabled,
}) => (
  <div className="mb-3">
    <Field
      name={`spending_limit_periods.${period}.enabled`}
      type="checkbox"
      render={({ input }) => (
        <Checkbox
          id={`spending-limit-period-${period}`}
          label={getSpendingLimitPeriodLabel(period)}
          description={
            DAILY_REPORTED_PERIODS.includes(period)
              ? translate('Needs the integration to report usage per day.')
              : period === 'total'
                ? translate(
                    'Counts all usage since the resource started. Never resets: once reached, it holds until the customer raises or clears it.',
                  )
                : undefined
          }
          checked={Boolean(input.checked)}
          onCheckedChange={(checked) => input.onChange(checked)}
        />
      )}
    />
    {enabled && (
      <Row className="g-5 mt-0 ps-6">
        <Col xs={6}>
          <NumberGroup
            name={`spending_limit_periods.${period}.default`}
            label={translate('Default')}
            description={translate('What the order form starts from.')}
            min={0}
            step="0.01"
            showSteppers={false}
            validate={validateDefault(period)}
            // Errors may come from another field (the maximum, a longer
            // period's default), so they show without this one being touched.
            forceTouched
            spaceless
          />
        </Col>
        <Col xs={6}>
          <NumberGroup
            name={`spending_limit_periods.${period}.maximum`}
            label={translate('Maximum')}
            description={translate('The highest limit a customer may set.')}
            min={0}
            step="0.01"
            showSteppers={false}
            validate={validateMaximum}
            forceTouched
            spaceless
          />
        </Col>
      </Row>
    )}
  </div>
);

/**
 * Whether customers can set spending limits on a usage-based component, and
 * for which periods. Writes `spending_limits_enabled` and
 * `spending_limit_periods` in the dialog's own shape; `formatComponent` turns
 * them into the API's `spending_limit_periods`.
 */
export const ComponentSpendingLimitPeriodsField: FC = () => {
  const { values } = useFormState<Values>({ subscription: { values: true } });
  const periods = values.spending_limit_periods || {};
  const noneTicked = !SPENDING_LIMIT_PERIODS.some(
    (period) => periods[period]?.enabled,
  );

  return (
    <>
      <BooleanGroup
        label={translate('Customers can set spending limits')}
        name="spending_limits_enabled"
        validate={validateEnabled}
        hideError
        size="sm"
        align="center"
        space={4}
      />
      {values.spending_limits_enabled && (
        <div data-testid="spending-limit-periods">
          {SPENDING_LIMIT_PERIODS.map((period) => (
            <PeriodRow
              key={period}
              period={period}
              enabled={Boolean(periods[period]?.enabled)}
            />
          ))}
          {noneTicked && <FieldError error={getNoPeriodError()} />}
        </div>
      )}
    </>
  );
};
