import { DateTime } from 'luxon';
import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { change, getFormValues } from 'redux-form';

import { AwesomeRadioButton } from '@/core/AwesomeRadioButton';
import { ENV } from '@/core/config';
import { formatDate, parseDate } from '@/core/dateUtils';
import { defaultCurrency } from '@/core/formatCurrency';
import { lessThanOrEqual, required } from '@/core/validators';
import { NumberField } from '@/form';
import { AsyncSelectField } from '@/form/AsyncSelectField';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { DateField } from '@/form/DateField';
import { formatJsxTemplate, translate } from '@/i18n';
import { providerOfferingsAutocomplete } from '@/marketplace/common/autocompletes';
import { Column } from '@/table/types';
import { renderFieldOrDash } from '@/table/utils';

import { BaseCreditFormData } from './types';

export const COMMON_CREDIT_COLUMNS: Column[] = [
  {
    title: translate('Eligible offerings'),
    render: ({ row }) => (
      <>
        {renderFieldOrDash(
          row.offerings.map((offering) => offering.name).join(', '),
        )}
      </>
    ),

    export: (row) =>
      renderFieldOrDash(
        row.offerings.map((offering) => offering.name).join(', '),
      ),
  },
  {
    title: translate('End date'),
    render: ({ row }) =>
      row.end_date ? formatDate(row.end_date) : <>&mdash;</>,
    orderField: 'end_date',
    export: 'end_date',
  },
  {
    title: translate('Allocated credit'),
    render: ({ row }) => defaultCurrency(row.value),
    orderField: 'value',
    export: (row) => defaultCurrency(row.value),
  },
];

const getStartOfNextMonth = () =>
  DateTime.now().plus({ months: 1 }).startOf('month');

const validatePercent = (value) => {
  if (!value) {
    return undefined;
  }
  const valueAsNumber = Number(value);
  if (isNaN(valueAsNumber)) {
    return translate('Must be a number');
  }
  if (valueAsNumber < 0) {
    return translate('Must be greater than or equal to 0');
  }
  if (valueAsNumber > 100) {
    return translate('Must be less than or equal to 100');
  }
  return undefined;
};

export const minimalConsumptionLogicOptions = [
  {
    label: translate('Fixed'),
    value: 'fixed',
    description: translate('A minimal guaranteed credit reduction per month.'),
  },
  {
    label: translate('Linear'),
    value: 'linear',
    description: translate(
      'A minimum amount deducted monthly, calculated based on the end date. Updated on the start of the month.',
    ),
  },
];

export const getMinimalConsumptionFieldIndex = (field: string) => {
  switch (field) {
    case 'end_date':
      return 0;
    case 'minimal_consumption_logic':
      return 1;
    case 'expected_consumption':
      return 2;
    case 'grace_coefficient':
      return 3;
    case 'apply_as_minimal_consumption':
      return 4;

    default:
      break;
  }
};

export const useMinimalConsumptionFields = (formId: string, initialValues) => {
  const formValues = (useSelector(getFormValues(formId)) ||
    {}) as BaseCreditFormData;

  const dispatch = useDispatch();

  useEffect(() => {
    if (!initialValues?.minimal_consumption_logic) {
      dispatch(change(formId, 'minimal_consumption_logic', 'fixed'));
    }
  }, []);

  useEffect(() => {
    if (formValues.minimal_consumption_logic === 'linear') {
      if (
        formValues.end_date &&
        parseDate(formValues.end_date) < getStartOfNextMonth() &&
        formValues.end_date !== initialValues?.end_date
      ) {
        dispatch(change(formId, 'end_date', null));
      }
    }
  });

  const onlyFirstDayOfMonth = useCallback(
    (date: Date) => date.getDate() === 1,
    [],
  );

  return [
    <DateField
      name="end_date"
      key="end_date"
      label={translate('End date')}
      placeholder={translate('Select date...')}
      description={translate('On that date all credit will be set to 0')}
      required={formValues.minimal_consumption_logic === 'linear'}
      validate={
        formValues.minimal_consumption_logic === 'linear'
          ? [required]
          : undefined
      }
      minDate={
        formValues.minimal_consumption_logic === 'linear'
          ? getStartOfNextMonth().toISO()
          : undefined
      }
      enable={[onlyFirstDayOfMonth]}
    />,

    <AwesomeRadioButton
      label={translate('Minimal consumption logic')}
      name="minimal_consumption_logic"
      key="minimal_consumption_logic"
      direction="horizontal"
      choices={minimalConsumptionLogicOptions}
      hideLabel
    />,

    <NumberField
      label={translate('Expected consumption (per month)')}
      name="expected_consumption"
      key="expected_consumption"
      placeholder="0"
      description={translate('Enter the expected credit reduction per month')}
      unit={ENV.plugins.WALDUR_CORE.CURRENCY_NAME}
    />,

    <NumberField
      label={translate('Grace coefficient')}
      name="grace_coefficient"
      key="grace_coefficient"
      placeholder="0"
      unit="%"
      validate={validatePercent}
    />,

    <AwesomeCheckboxField
      label={translate('Apply as minimal consumption')}
      name="apply_as_minimal_consumption"
      key="apply_as_minimal_consumption"
      hideLabel
    />,
  ];
};

export const useCustomerCreditOfferingsField = () => {
  return (
    <AsyncSelectField
      name="offerings"
      label={translate('Offering(s)')}
      placeholder={translate('All')}
      loadOptions={(query, prevOptions, page) =>
        providerOfferingsAutocomplete(
          { name: query, billable: true },
          prevOptions,
          page,
        )
      }
      isMulti
      getOptionValue={(option) => option.uuid}
      getOptionLabel={(option) =>
        option.category_title
          ? `${option.category_title} / ${option.name}`
          : option.name
      }
      noOptionsMessage={() => translate('No offerings')}
    />
  );
};

export const useCustomerAllocateCreditField = () => {
  return (
    <NumberField
      label={translate('Allocate credit ({currency})', {
        currency: ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
      })}
      name="value"
      placeholder="0"
      validate={required}
      required
      unit={ENV.plugins.WALDUR_CORE.CURRENCY_NAME}
    />
  );
};

export const useProjectAllocateCreditField = (
  organizationCredit: number | string,
  isEdit: boolean,
) => {
  const exceeds = useMemo(
    () => lessThanOrEqual(Number(organizationCredit ?? 0)),
    [organizationCredit],
  );
  const valueFieldDescriptionData = {
    currency: ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
    credits: organizationCredit ?? 0,
  };
  return (
    <NumberField
      label={translate('Allocate credit ({currency})', {
        currency: ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
      })}
      name="value"
      placeholder="0"
      description={
        isEdit
          ? translate(
              'Previously saved credit value for this organization: {currency} {credits}',
              valueFieldDescriptionData,
              formatJsxTemplate,
            )
          : translate(
              'Credits available for this organization: {currency} {credits}',
              valueFieldDescriptionData,
              formatJsxTemplate,
            )
      }
      unit={ENV.plugins.WALDUR_CORE.CURRENCY_NAME}
      validate={[required, exceeds]}
      required
    />
  );
};
