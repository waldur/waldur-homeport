import { InjectedFormProps, reduxForm } from 'redux-form';

type Children =
  | string
  | JSX.Element
  | JSX.Element[]
  | ((props: Omit<InjectedFormProps, 'handleSubmit'>) => JSX.Element);

export const Form = reduxForm<{}, { onSubmit; children: Children }>({})(
  ({ handleSubmit, onSubmit, children, ...rest }) => (
    <form onSubmit={handleSubmit(onSubmit)}>
      {typeof children === 'function' ? children(rest) : children}
    </form>
  ),
);
