import { DateField } from './DateField';
import { DateTimeField } from './DateTimeField';
import { NumberField } from './NumberField';
import { RadioGroupField } from './RadioGroupField';
import { SelectField } from './select/SelectField';
import { StringField } from './StringField';
import { SwitchField } from './SwitchField';
import { withFormGroup } from './withFormGroup';

export * from './FormGroup';
export * from './withFormGroup';
export * from './FieldError';
export * from './FieldWarning';
export * from './InputField';
export * from './StringField';
export * from './NumberField';
export * from './SwitchField';
export * from './DateField';
export * from './DateTimeField';
export * from './DateTimeRangeField';
export * from './RangeDateField';
export * from './RangeNumberField';
export * from './RadioGroupField';
export * from './SubmitButton';
export * from './FilterBox';
export * from './useDateFieldA11y';
export * from './types';
export * from './required';
export * from './select';

// Group components combining field adapter with FormGroup and Field
export const StringGroup = withFormGroup(StringField);
export const SelectGroup = withFormGroup(SelectField);
export const NumberGroup = withFormGroup(NumberField);
export const BooleanGroup = withFormGroup(SwitchField, {
  passLabelToControl: true,
});
export const RadioGroup = withFormGroup(RadioGroupField, {
  passLabelToControl: true,
});
export const DateGroup = withFormGroup(DateField);
export const DateTimeGroup = withFormGroup(DateTimeField);
