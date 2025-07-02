import React, { PropsWithChildren } from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { SubmitButton, FormContainer, FieldError } from '@waldur/form';

import { CloseDialogButton } from './CloseDialogButton';
import { ModalDialog } from './ModalDialog';

interface ActionDialogProps {
  title?: string;
  submitLabel: string;
  submitting?: boolean;
  loading?: boolean;
  invalid?: boolean;
  onSubmit: any;
  error?: string;
  fullButtons?: boolean;
}

export const ActionDialog: React.FC<PropsWithChildren<ActionDialogProps>> = (
  props,
) => (
  <form onSubmit={props.onSubmit}>
    <ModalDialog
      title={props.title}
      footer={
        <>
          <CloseDialogButton
            className={props.fullButtons ? 'flex-equal' : undefined}
          />

          <SubmitButton
            disabled={props.invalid}
            submitting={props.submitting}
            label={props.submitLabel}
            className={
              props.fullButtons ? 'btn btn-primary flex-equal' : undefined
            }
          />
        </>
      }
    >
      {props.loading ? (
        <LoadingSpinner />
      ) : (
        <FormContainer submitting={props.submitting} className="col-l">
          {props.children}
        </FormContainer>
      )}

      <FieldError error={props.error} />
    </ModalDialog>
  </form>
);
