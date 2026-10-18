import { FC } from 'react';
import { useFormState } from 'react-final-form';

import { FormField } from 'waldur-ui';

export const CreditFormError: FC = () => {
  const { error, submitError } = useFormState({
    subscription: { error: true, submitError: true },
  });

  if (!error && !submitError) return null;

  return (
    <FormField>
      <div className="text-danger mt-2">{error || submitError}</div>
    </FormField>
  );
};
