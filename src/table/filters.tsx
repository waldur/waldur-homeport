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

// The date filters open their calendar as soon as the filter is picked,
// the way SelectFilter/AsyncSelectFilter show their menu (`variant=
// "tableFilter"`): choosing the filter already says "I want to pick a
// date". Every entry point mounts the field only then — the "Add filter"
// row once opened, the column flyout once shown, the mobile accordion row
// once expanded — so this never fires for filters nobody opened.
const AutonomousDateFilter = withTableFilter(DateField);
export const DateFilter: typeof AutonomousDateFilter = (props) => (
  <AutonomousDateFilter autoOpen {...props} />
);

const AutonomousDateTimeFilter = withTableFilter(DateTimeField);
/** @public */
export const DateTimeFilter: typeof AutonomousDateTimeFilter = (props) => (
  <AutonomousDateTimeFilter autoOpen {...props} />
);

/** @public */
export const NumberFilter = withTableFilter(NumberField);

export const NumberRangeFilter = withTableFilter(RangeNumberField);

const AutonomousDateRangeFilter = withTableFilter(RangeDateField);
export const DateRangeFilter: typeof AutonomousDateRangeFilter = (props) => (
  <AutonomousDateRangeFilter autoOpen {...props} />
);
