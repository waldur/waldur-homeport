import { reduxForm } from 'redux-form';

export const Form = reduxForm<{}, { onSubmit }>({})(
  ({ handleSubmit, onSubmit, children }) => (
    <form onSubmit={handleSubmit(onSubmit)}>{children}</form>
  ),
);
