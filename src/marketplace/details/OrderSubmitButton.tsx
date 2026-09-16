import { ShoppingCartIcon } from '@phosphor-icons/react';
import { FORM_ERROR } from 'final-form';
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
      submitError: true,
      submitErrors: true,
      hasValidationErrors: true,
      hasSubmitErrors: true,
      dirtySinceLastSubmit: true,
      dirty: true,
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

  // A rejected order must not brick the form. final-form counts submitErrors
  // towards `invalid` and keeps them until the *next* submit, but the only way
  // to submit again is this button: gating on `invalid` therefore disabled it
  // permanently, and the sole way out was reloading the page. Validation errors
  // still block, and a submit error blocks only until something is edited.
  const staleSubmitError =
    formState.hasSubmitErrors && !formState.dirtySinceLastSubmit;

  const isDisabled =
    Boolean(errorsExist) ||
    formState.hasValidationErrors ||
    formState.submitting ||
    staleSubmitError;

  // Why the button is disabled, in the tooltip's own words.
  //
  // A rejected submit leaves its reason in submitError/submitErrors -- never in
  // `errors`. Feeding the tooltip validation errors alone therefore rendered an
  // empty bubble, leaving a dead button with nothing to explain it: an order
  // the API refuses (a tenant with no quotas, say) looked identical to one
  // still missing a required field. DeployPageSidebar already merges both
  // sources for the step list; this does the same, and keeps a generic fallback
  // so the bubble is never blank.
  const disabledReason = useMemo(() => {
    if (projectError) {
      return projectError;
    }
    // FORM_ERROR is final-form's own key for the form-level message. Left in
    // the map it renders as the literal "Final form form error:", so it is
    // pulled out and used only as the fallback.
    //
    // Submit errors are only worth reporting while they are still the reason
    // the button is disabled; once something has been edited the button is
    // live again, and repeating the previous rejection would just mislead.
    const { [FORM_ERROR]: formLevelError, ...merged } = {
      ...formState.errors,
      ...(staleSubmitError ? formState.submitErrors : {}),
    };
    if (Object.keys(merged).length) {
      return merged;
    }
    const formError = staleSubmitError
      ? formLevelError || formState.submitError
      : undefined;
    if (formError) {
      return formError;
    }
    return translate('Some required information is missing or invalid.');
  }, [
    projectError,
    staleSubmitError,
    formState.errors,
    formState.submitErrors,
    formState.submitError,
  ]);

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
              <FieldErrorMessage error={disabledReason} />
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
