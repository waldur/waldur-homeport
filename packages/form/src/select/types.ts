import { CustomAsyncSelectProps, CustomSelectProps } from 'waldur-ui';

export interface SelectFieldProps extends CustomSelectProps {
  simpleValue?: boolean;
  noUpdateOnBlur?: boolean;
}

export interface AsyncSelectFieldProps extends CustomAsyncSelectProps {
  simpleValue?: boolean;
}
