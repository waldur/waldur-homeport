import arrayMutators from 'final-form-arrays';
import { get, set } from 'lodash-es';
import { useMemo } from 'react';
import { Field, Form } from 'react-final-form';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

import { FieldEditButtonProps } from './FieldEditButton.types';

export const EditFieldDialog = (props: { resolve: FieldEditButtonProps }) => {
  const { closeDialog } = useModal();

  const initialValues = useMemo(
    () => ({
      value: get(props.resolve.scope, props.resolve.name),
    }),
    [props.resolve],
  );

  return (
    <Form
      mutators={{ ...arrayMutators }}
      initialValues={initialValues}
      onSubmit={(formData) =>
        props.resolve
          .callback(set({}, props.resolve.name, formData.value))
          .then(() => {
            closeDialog();
          })
          // The callback (a mutation) surfaces its own error notification and
          // rejects on failure; keep the dialog open and swallow the rejection
          // so it doesn't bubble up as an unhandled promise rejection.
          .catch(() => {})
      }
      render={({ handleSubmit, submitting, invalid, dirty }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={props.resolve.title}
            subtitle={props.resolve.description}
            headerLess={!props.resolve.title}
            footer={
              <>
                <CloseDialogButton className="flex-equal" />
                <SubmitButton
                  disabled={invalid || !dirty}
                  submitting={submitting}
                  label={translate('Confirm')}
                  className="btn btn-primary flex-equal"
                />
              </>
            }
          >
            <Field
              render={props.resolve.fieldComponent}
              name="value"
              label={props.resolve.hideLabel ? undefined : props.resolve.label}
              tooltip={props.resolve.warnTooltip}
              required={props.resolve.required}
              {...props.resolve.fieldProps}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
