import { FC } from 'react';
import { Form as BootstrapForm } from 'react-bootstrap';
import { useFormState } from 'react-final-form';

export const CreditFormError: FC = () => {
  const { error, submitError } = useFormState({
    subscription: { error: true, submitError: true },
  });

  if (!error && !submitError) return null;

  return (
    <BootstrapForm.Group>
      <div className="text-danger mt-2">{error || submitError}</div>
    </BootstrapForm.Group>
  );
};
