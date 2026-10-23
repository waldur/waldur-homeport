import { ComponentProps } from 'react';

import { AsyncSelect } from 'waldur-ui';

import { lazyOnce } from '@/core/lazyOnce';

import { CommaSeparatedListField } from './CommaSeparatedListField';
import { CountrySelectField } from './CountrySelectField';
import { EmailField } from './EmailField';
import { FileUploadField } from './FileUploadField';
import { ImageField } from './ImageField';
import type MarkdownEditor from './MarkdownEditor';
import type { MonacoField } from './MonacoField';
import { SecretField } from './SecretField';
import { CreatableSelectField } from './select/CreatableSelectField';
import { SelectField } from './select/SelectField';
import { SliderNumberField } from './SliderNumberField';
import { TextField } from './TextField';
import { TimezoneField } from './TimezoneField';
import { withFormGroup } from './withFormGroup';
import { YearField } from './YearField';

export {
  BooleanGroup,
  DateGroup,
  DateTimeGroup,
  FieldError,
  NumberGroup,
  RadioGroup,
  StringGroup,
  SubmitButton,
} from 'waldur-form';

export { FormGroup } from './FormGroup';
export { NumberField } from './NumberField';
export { BaseStringField, StringField } from './StringField';
export { FileUploadField } from './FileUploadField';
export { FormFooter } from './FormFooter';
export { SelectField } from './select/SelectField';
export { TextField } from './TextField';
export { BaseSecretField } from './SecretField';

export const SelectGroup = withFormGroup(SelectField);
export const TextGroup = withFormGroup(TextField);
export const AsyncSelectGroup = withFormGroup(AsyncSelect);
export const CreatableSelectGroup = withFormGroup(CreatableSelectField);
export const SliderNumberGroup = withFormGroup(SliderNumberField);
export const CountrySelectGroup = withFormGroup(CountrySelectField);

// Monaco and the markdown editor are the two heaviest dependencies in the
// app; loaded on first use so this barrel stays cheap for everything else.
// lazyOnce, not lazyComponent: once the chunk is in, later fields must mount
// synchronously (NotificationForm renders one Monaco field per tab).
const LazyMarkdownEditor = lazyOnce<ComponentProps<typeof MarkdownEditor>>(
  () => import('./MarkdownEditor'),
);
const LazyMonacoField = lazyOnce<ComponentProps<typeof MonacoField>>(() =>
  import('./MonacoField').then((module) => ({ default: module.MonacoField })),
);
export const MarkdownGroup = withFormGroup(LazyMarkdownEditor);
export const MonacoGroup = withFormGroup(LazyMonacoField);
export const TimezoneGroup = withFormGroup(TimezoneField);
export const SecretGroup = withFormGroup(SecretField);
export const EmailGroup = withFormGroup(EmailField);
export const ImageGroup = withFormGroup(ImageField);
export const CommaSeparatedListGroup = withFormGroup(CommaSeparatedListField);
export const FileUploadGroup = withFormGroup(FileUploadField);
export const YearGroup = withFormGroup(YearField);
