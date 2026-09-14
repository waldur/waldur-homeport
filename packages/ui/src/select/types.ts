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

// Narrower than react-final-form's `FieldMetaState` on purpose: this package
// has no dependency on a form library, and `hasError` (tailwindStyles.ts)
// only ever reads `touched`/`error`. A real `FieldMetaState` object is
// structurally assignable here, so callers that do use react-final-form
// (src/form/select's `*Field` wrappers) pass their `meta` through unchanged.
interface SelectFieldMeta {
  touched?: boolean;
  error?: any;
}

export type CustomSelectProps = {
  size?: 'sm';
  variant?: 'tableFilter' | 'tableCell';
  input?: SelectFieldInputProps;
  meta?: SelectFieldMeta;
  disabled?: boolean;
} & SelectProps<any, any, any>;

export type CustomCreatableSelectProps = {
  size?: 'sm';
  variant?: 'tableFilter' | 'tableCell';
  input?: SelectFieldInputProps;
  meta?: SelectFieldMeta;
  disabled?: boolean;
} & CreatableProps<any, any, any>;

export type CustomAsyncSelectProps = {
  size?: 'sm';
  variant?: 'tableFilter' | 'tableCell';
  input?: SelectFieldInputProps;
  meta?: SelectFieldMeta;
  disabled?: boolean;
} & AsyncPaginateProps<any, GroupBase<any>, any, any>;

export type CustomAsyncCreatableSelectProps = {
  size?: 'sm';
  variant?: 'tableFilter' | 'tableCell';
  input?: SelectFieldInputProps;
  meta?: SelectFieldMeta;
  disabled?: boolean;
} & AsyncPaginateProps<any, GroupBase<any>, any, any> &
  CreatableProps<any, any, any>;

export type AsyncSelectLoader<
  Option = any,
  Additional = { page: number },
> = LoadOptions<Option, GroupBase<Option>, Additional>;
