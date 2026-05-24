import { FieldProps } from 'react-final-form';
import { GroupBase, Props as SelectProps } from 'react-select';
import { CreatableProps } from 'react-select/creatable';
import { AsyncPaginateProps, LoadOptions } from 'react-select-async-paginate';

export type CustomSelectProps = {
  size?: 'sm';
  variant?: 'tableFilter';
} & SelectProps<any, any, any> &
  Partial<Omit<FieldProps<any, any>, 'onChange'>>;

export type CustomCreatableSelectProps = {
  size?: 'sm';
  variant?: 'tableFilter';
} & CreatableProps<any, any, any> &
  Partial<Omit<FieldProps<any, any>, 'onChange'>>;

export type CustomAsyncSelectProps = {
  size?: 'sm';
  variant?: 'tableFilter';
} & AsyncPaginateProps<any, GroupBase<any>, any, any> &
  Partial<Omit<FieldProps<any, any>, 'onChange'>>;

export type CustomAsyncCreatableSelectProps = {
  size?: 'sm';
  variant?: 'tableFilter';
} & AsyncPaginateProps<any, GroupBase<any>, any, any> &
  CreatableProps<any, any, any> &
  Partial<Omit<FieldProps<any, any>, 'onChange'>>;

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
  name: string;
}
