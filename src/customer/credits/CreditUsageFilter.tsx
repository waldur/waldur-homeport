import { DateTime } from 'luxon';
import Select from 'react-select';
import { reduxForm, Field, InjectedFormProps } from 'redux-form';

import { REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { OfferingAutocomplete } from '@waldur/marketplace/offerings/details/OfferingAutocomplete';
import { ResourceAutocomplete } from '@waldur/resource/ResourceAutocomplete';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

interface CreditUsageFilterOwnProps {
  customerUUID?: string;
}

const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = 0; i < 6; i++) {
    const year = currentYear - i;
    years.push({ label: year.toString(), value: year });
  }
  return years;
};

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  label: DateTime.local()
    .set({ month: i + 1 })
    .toFormat('LLLL'),
  value: i + 1,
}));

const renderSelectField = (props) => {
  const { input, options, ...rest } = props;

  const handleChange = (selectedOption) => {
    input.onChange(selectedOption ? selectedOption.value : null);
  };

  const value = options.find((option) => option.value === input.value) || null;

  return (
    <Select
      {...rest}
      options={options}
      value={value}
      onChange={handleChange}
      onBlur={() => input.onBlur(input.value)}
      classNamePrefix="react-select"
      {...REACT_SELECT_TABLE_FILTER}
    />
  );
};

const CreditUsageFilterComponent = (
  props: InjectedFormProps & CreditUsageFilterOwnProps,
) => {
  const yearOptions = generateYearOptions();

  return (
    <>
      <TableFilterItem
        title={translate('Offering')}
        name="offering"
        badgeValue={(value) => value?.name}
      >
        <OfferingAutocomplete reactSelectProps={REACT_SELECT_TABLE_FILTER} />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Resource')}
        name="resource"
        badgeValue={(value) => value?.name}
      >
        <ResourceAutocomplete
          params={{ customer_uuid: props.customerUUID }}
          reactSelectProps={REACT_SELECT_TABLE_FILTER}
        />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Year')}
        name="year"
        badgeValue={(value) => value?.toString()}
      >
        <Field
          name="year"
          component={renderSelectField}
          options={yearOptions}
        />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Month')}
        name="month"
        badgeValue={(value) => {
          const month = MONTH_OPTIONS.find((m) => m.value === value);
          return month ? month.label : '';
        }}
      >
        <Field
          name="month"
          component={renderSelectField}
          options={MONTH_OPTIONS}
        />
      </TableFilterItem>
    </>
  );
};

export const CreditUsageFilter = reduxForm<any, CreditUsageFilterOwnProps>({
  form: 'CreditUsageFilter',
  touchOnChange: true,
  destroyOnUnmount: false,
})(CreditUsageFilterComponent);
