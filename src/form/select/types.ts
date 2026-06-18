import { FieldMetaState } from 'react-final-form';
import { GroupBase, Props as SelectProps } from 'react-select';
import { CreatableProps } from 'react-select/creatable';
import { AsyncPaginateProps, LoadOptions } from 'react-select-async-paginate';

interface SelectFieldInputProps {
  name?: string;
  value?: any;
  onChange?: (...args: any[]) => void;
  onBlur?: (...args: any[]) => void;
  onFocus?: (...args: any[]) => void;
}

export type CustomSelectProps = {
  size?: 'sm';
  variant?: 'tableFilter';
  input?: SelectFieldInputProps;
  meta?: Partial<FieldMetaState<any>>;
  disabled?: boolean;
} & SelectProps<any, any, any>;

export type CustomCreatableSelectProps = {
  size?: 'sm';
  variant?: 'tableFilter';
  input?: SelectFieldInputProps;
  meta?: Partial<FieldMetaState<any>>;
  disabled?: boolean;
} & CreatableProps<any, any, any>;

export type CustomAsyncSelectProps = {
  size?: 'sm';
  variant?: 'tableFilter';
  input?: SelectFieldInputProps;
  meta?: Partial<FieldMetaState<any>>;
  disabled?: boolean;
} & AsyncPaginateProps<any, GroupBase<any>, any, any>;

export type CustomAsyncCreatableSelectProps = {
  size?: 'sm';
  variant?: 'tableFilter';
  input?: SelectFieldInputProps;
  meta?: Partial<FieldMetaState<any>>;
  disabled?: boolean;
} & AsyncPaginateProps<any, GroupBase<any>, any, any> &
  CreatableProps<any, any, any>;

export type AsyncSelectLoader<
  Option = any,
  Additional = { page: number },
> = LoadOptions<Option, GroupBase<Option>, Additional>;

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
