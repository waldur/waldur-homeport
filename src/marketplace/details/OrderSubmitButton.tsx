import { ShoppingCartIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { useFormState } from 'react-final-form';

import { Tooltip } from 'waldur-ui';

import { parseDate } from '@/core/dateUtils';
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

  const isDisabled =
    Boolean(errorsExist) || formState.invalid || formState.submitting;

  const Btn = (
    <SubmitButton
      submitting={formState.submitting}
      disabled={isDisabled}
      type="submit"
      className="w-100"
      label={translate('Create')}
      iconNode={<ShoppingCartIcon weight="bold" />}
      iconOnLeft
    />
  );

  return (
    <FloatingButton>
      {/* Tied to `isDisabled`, not just `errorsExist`: a missing plan or
          project disables the button without landing in errorsExist, which
          left it disabled and silent. */}
      {isDisabled ? (
        <Tooltip
          label={
            formState.submitting ? (
              translate('Submission in progress')
            ) : (
              <FieldErrorMessage error={projectError || errors} />
            )
          }
          autoWidth
        >
          <span className="w-100">{Btn}</span>
        </Tooltip>
      ) : (
        Btn
      )}
    </FloatingButton>
  );
};
