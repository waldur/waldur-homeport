import {
  CustomAsyncSelectProps,
  CustomCreatableSelectProps,
  CustomSelectProps,
} from 'waldur-ui';

// Field-specific extensions layered on top of waldur-ui's framework-agnostic
// select props: `simpleValue`/`noUpdateOnBlur` only make sense for a
// react-final-form `Field`'s `input`/`meta` adapter, which is what
// SelectField/AsyncSelectField/CreatableSelectField in this directory are.
export interface SelectFieldProps extends CustomSelectProps {
  simpleValue?: boolean;
  noUpdateOnBlur?: boolean;
}

export interface CreatableSelectFieldProps extends CustomCreatableSelectProps {
  simpleValue?: boolean;
  noUpdateOnBlur?: boolean;
}

export interface AsyncSelectFieldProps extends CustomAsyncSelectProps {
  simpleValue?: boolean;
}
