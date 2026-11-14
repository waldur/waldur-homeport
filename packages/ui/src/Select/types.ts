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

/** What this package adds to every react-select flavour. */
interface SelectExtraProps {
  size?: 'sm';
  variant?: 'tableFilter' | 'tableCell';
  /** `tableFilter` only: keep the inline menu permanently open (default). */
  menuAlwaysOpen?: boolean;
  input?: SelectFieldInputProps;
  meta?: SelectFieldMeta;
  disabled?: boolean;
}

export type CustomSelectProps = SelectExtraProps & SelectProps<any, any, any>;

export type CustomCreatableSelectProps = SelectExtraProps &
  CreatableProps<any, any, any>;

export type CustomAsyncSelectProps = SelectExtraProps &
  AsyncPaginateProps<any, GroupBase<any>, any, any>;

export type CustomAsyncCreatableSelectProps = SelectExtraProps &
  AsyncPaginateProps<any, GroupBase<any>, any, any> &
  CreatableProps<any, any, any>;

export type AsyncSelectLoader<
  Option = any,
  Additional = { page: number },
> = LoadOptions<Option, GroupBase<Option>, Additional>;
