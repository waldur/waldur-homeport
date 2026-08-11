import { FC } from 'react';

import { SelectField } from '@/form';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { DateField } from '@/form/DateField';
import { DateTimeField } from '@/form/DateTimeField';
import { NumberField } from '@/form/NumberField';
import { RangeDateField } from '@/form/RangeDateField';
import { RangeNumberField } from '@/form/RangeNumberField';
import { AsyncSelect } from '@/form/select';
import { StringField } from '@/form/StringField';

import { useNormalizeSelectFilterValue } from './normalizeFilterValue';
import { withTableFilter } from './withTableFilter';

const AutonomousSelectFilter = withTableFilter(SelectField);
export const SelectFilter: FC<any> = (props) => {
  useNormalizeSelectFilterValue(props.name, !!props.isMulti, props.options);
  return <AutonomousSelectFilter variant="tableFilter" {...props} />;
};

const AutonomousAsyncSelectFilter = withTableFilter(AsyncSelect);
export const AsyncSelectFilter: FC<any> = (props) => {
  useNormalizeSelectFilterValue(props.name, !!props.isMulti);
  return <AutonomousAsyncSelectFilter variant="tableFilter" {...props} />;
};

export const BooleanFilter = withTableFilter(AwesomeCheckboxField, {
  passLabelToControl: true,
});

export const StringFilter = withTableFilter(StringField);

export const DateFilter = withTableFilter(DateField);

/** @public */
export const DateTimeFilter = withTableFilter(DateTimeField);

/** @public */
export const NumberFilter = withTableFilter(NumberField);

export const NumberRangeFilter = withTableFilter(RangeNumberField);

export const DateRangeFilter = withTableFilter(RangeDateField);
