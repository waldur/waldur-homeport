import { AwesomeRadioButton } from '@/core/AwesomeRadioButton';

import { AwesomeCheckboxField } from './AwesomeCheckboxField';
import { CommaSeparatedListField } from './CommaSeparatedListField';
import { CountrySelectField } from './CountrySelectField';
import { DateField } from './DateField';
import { DateTimeField } from './DateTimeField';
import { EmailField } from './EmailField';
import { FileUploadField } from './FileUploadField';
import { ImageField } from './ImageField';
import MarkdownEditor from './MarkdownEditor';
import { MonacoField } from './MonacoField';
import { NumberField } from './NumberField';
import { SecretField } from './SecretField';
import { AsyncSelect } from './select/AsyncSelect';
import { CreatableSelectField } from './select/CreatableSelectField';
import { SelectField } from './select/SelectField';
import { SliderNumberField } from './SliderNumberField';
import { StringField } from './StringField';
import { TextField } from './TextField';
import { TimeField } from './TimeField';
import { TimezoneField } from './TimezoneField';
import { withFormGroup } from './withFormGroup';
import { YearField } from './YearField';

export { FieldError } from './FieldError';
export { FileUploadField } from './FileUploadField';
export { FormFooter } from './FormFooter';
export { FormGroup } from './FormGroup';
export { NumberField } from './NumberField';
export { SelectField } from './select/SelectField';
export { StringField } from './StringField';
export { SubmitButton } from './SubmitButton';
export { TextField } from './TextField';

// Base components — pure UI, no form knowledge
export { BaseStringField } from './StringField';
export { BaseSecretField } from './SecretField';

export const StringGroup = withFormGroup(StringField);
export const SelectGroup = withFormGroup(SelectField);
export const TextGroup = withFormGroup(TextField);
export const NumberGroup = withFormGroup(NumberField);
export const AsyncSelectGroup = withFormGroup(AsyncSelect);
export const CreatableSelectGroup = withFormGroup(CreatableSelectField);
export const BooleanGroup = withFormGroup(AwesomeCheckboxField, {
  passLabelToControl: true,
});
export const RadioGroup = withFormGroup(AwesomeRadioButton, {
  passLabelToControl: true,
});
export const DateGroup = withFormGroup(DateField);
export const DateTimeGroup = withFormGroup(DateTimeField);
export const TimeGroup = withFormGroup(TimeField);
export const SliderNumberGroup = withFormGroup(SliderNumberField);
export const CountrySelectGroup = withFormGroup(CountrySelectField);
export const MarkdownGroup = withFormGroup(MarkdownEditor);
export const MonacoGroup = withFormGroup(MonacoField);
export const TimezoneGroup = withFormGroup(TimezoneField);
export const SecretGroup = withFormGroup(SecretField);
export const EmailGroup = withFormGroup(EmailField);
export const ImageGroup = withFormGroup(ImageField);
export const CommaSeparatedListGroup = withFormGroup(CommaSeparatedListField);
export const FileUploadGroup = withFormGroup(FileUploadField);
export const YearGroup = withFormGroup(YearField);
