import { CustomCreatableSelectProps } from 'waldur-ui';

// SelectField and AsyncSelectField, with their props, live in waldur-form.
// CreatableSelectField is homeport's only; `simpleValue`/`noUpdateOnBlur`
// only make sense for a react-final-form `Field`'s `input`/`meta` adapter.
export interface CreatableSelectFieldProps extends CustomCreatableSelectProps {
  simpleValue?: boolean;
  noUpdateOnBlur?: boolean;
}
