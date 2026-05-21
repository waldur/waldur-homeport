import { ShoppingCartIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { useFormState } from 'react-final-form';

import { parseDate } from '@/core/dateUtils';
import { Tip } from '@/core/Tooltip';
import { SubmitButton } from '@/form';
import { FieldErrorMessage } from '@/form/FieldError';
import { FloatingButton } from '@/form/FloatingButton';
import { translate } from '@/i18n';

import { useOrderFormData } from '../deploy/selectors';

export const OrderSubmitButton = () => {
  const { project } = useOrderFormData();
  const formState = useFormState({
    subscription: {
      errors: true,
      dirty: true,
      invalid: true,
      submitting: true,
    },
  });

  const projectError = useMemo(() => {
    if (project?.end_date) {
      const endDate = parseDate(project.end_date);
      const now = parseDate(null);
      if (endDate.hasSame(now, 'day') || endDate < now) {
        return translate('Project has reached its end date.');
      }
    }
    return null;
  }, [project]);

  const errors = formState.errors;

  const errorsExist =
    projectError ||
    errors?.attributes ||
    errors?.limits ||
    errors?.plan_entries;

  const Btn = (
    <SubmitButton
      submitting={formState.submitting}
      disabled={
        Boolean(errorsExist) || formState.invalid || formState.submitting
      }
      type="submit"
      className="w-100"
      label={translate('Create')}
      iconNode={<ShoppingCartIcon weight="bold" />}
      iconOnLeft
    />
  );

  return (
    <FloatingButton>
      {errorsExist ? (
        <Tip
          label={<FieldErrorMessage error={projectError || errors} />}
          id="offering-button-errors"
          autoWidth
          className="w-100"
        >
          {Btn}
        </Tip>
      ) : (
        Btn
      )}
    </FloatingButton>
  );
};
