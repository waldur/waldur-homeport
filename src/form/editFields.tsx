import { AwesomeCheckboxField } from './AwesomeCheckboxField';
import { BoxNumberField } from './BoxNumberField';
import { CommaSeparatedListField } from './CommaSeparatedListField';
import { CountrySelectField } from './CountrySelectField';
import { DateField } from './DateField';
import { EmailField } from './EmailField';
import MarkdownEditor from './MarkdownEditor';
import { MultiCountrySelectField } from './MultiCountrySelectField';
import { NumberField } from './NumberField';
import { PhoneNumberField } from './PhoneNumberField';
import { SecretField } from './SecretField';
import { AsyncSelectField } from './select/AsyncSelectField';
import { SelectField } from './select/SelectField';
import { StringField } from './StringField';
import { TextField } from './TextField';
import { withEditField } from './withEditField';

export { EditFieldProvider } from './EditFieldContext';
export { withEditField } from './withEditField';

export const StringEditField = withEditField(StringField);
export const SecretEditField = withEditField(SecretField);
export const TextEditField = withEditField(TextField);
export const NumberEditField = withEditField(NumberField);
export const SelectEditField = withEditField(SelectField);
export const BooleanEditField = withEditField(AwesomeCheckboxField, {
  passLabelToControl: true,
});
export const DateEditField = withEditField(DateField);
export const CommaSeparatedListEditField = withEditField(
  CommaSeparatedListField,
);
export const AsyncSelectEditField = withEditField(AsyncSelectField);
export const BoxNumberEditField = withEditField(BoxNumberField);
export const EmailEditField = withEditField(EmailField);

export const CountryEditField = withEditField(CountrySelectField);
export const MultiCountrySelectEditField = withEditField(
  MultiCountrySelectField,
);
export const MarkdownEditField = withEditField(MarkdownEditor);
export const PhoneNumberEditField = withEditField(PhoneNumberField);
