import { get, set } from 'es-toolkit/compat';
import { FORM_ERROR } from 'final-form';
import arrayMutators from 'final-form-arrays';
import { useMemo } from 'react';
import { Field, Form } from 'react-final-form';

import { getErrorBody } from '@/core/ErrorMessageFormatter';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

import { FieldEditButtonProps } from './FieldEditButton.types';
import { FieldError } from './FieldError';

/**
 * What a refused save said about the edited field itself -- a value the
 * server rejects for a reason the dialog cannot check up front -- so the
 * dialog can show it under the field, not only in the notification.
 */
const refusedFieldError = (error: any, name: string) => {
  if ((error?.status ?? error?.response?.status) !== 400) return undefined;
  const body = getErrorBody(error);
  if (!body) return undefined;
  const message = get(body, name) ?? body[name];
  return message ?? undefined;
};

export const EditFieldDialog = (props: { resolve: FieldEditButtonProps }) => {
  const { closeDialog } = useModal();

  const initialValues = useMemo(
    () => ({
      value: get(props.resolve.scope, props.resolve.name),
    }),
    [props.resolve],
  );

  // An emptied text input arrives as `undefined` (React Final Form's default
  // parse), and `JSON.stringify` then drops the key from the PATCH body — so
  // clearing a field used to be a silent no-op. Substitute an explicit empty
  // value instead. `??` is deliberately avoided: a field may declare `null` as
  // its empty value, and that must survive.
  const resolveValue = (value: any) => {
    if (value !== undefined) {
      return value;
    }
    return props.resolve.emptyValue === undefined
      ? ''
      : props.resolve.emptyValue;
  };

  return (
    <Form
      mutators={{ ...arrayMutators }}
      initialValues={initialValues}
      onSubmit={(formData) =>
        props.resolve
          .callback(set({}, props.resolve.name, resolveValue(formData.value)))
          .then(() => {
            closeDialog();
          })
          // The callback (a mutation) surfaces its own error notification and
          // rejects on failure; keep the dialog open and swallow the rejection
          // so it doesn't bubble up as an unhandled promise rejection. What
          // the server said about this field is shown under it as well.
          .catch((error) => {
            const message = refusedFieldError(error, props.resolve.name);
            return message ? { [FORM_ERROR]: message } : undefined;
          })
      }
      render={({
        handleSubmit,
        submitting,
        hasValidationErrors,
        dirty,
        submitError,
        dirtySinceLastSubmit,
      }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={props.resolve.title}
            subtitle={props.resolve.description}
            headerLess={!props.resolve.title}
            footer={
              <>
                <CloseDialogButton className="flex-1" />
                <SubmitButton
                  // A refused save leaves a submission error, not an invalid
                  // value: the user may change the value and try again.
                  disabled={hasValidationErrors || !dirty}
                  submitting={submitting}
                  label={translate('Confirm')}
                  variant="primary"
                  className="flex-1"
                />
              </>
            }
          >
            {props.resolve.dialogDescription && (
              <div className="mb-3">{props.resolve.dialogDescription}</div>
            )}
            <Field
              render={props.resolve.fieldComponent}
              name="value"
              label={props.resolve.hideLabel ? undefined : props.resolve.label}
              tooltip={props.resolve.warnTooltip}
              required={props.resolve.required}
              {...props.resolve.fieldProps}
            />
            {submitError && !dirtySinceLastSubmit && (
              <FieldError error={submitError} />
            )}
          </ModalDialog>
        </form>
      )}
    />
  );
};
