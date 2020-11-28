import React from 'react';

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
  layout?: 'horizontal' | 'vertical';
}

export const ActionDialog: React.FC<ActionDialogProps> = (props) => (
  <form onSubmit={props.onSubmit}>
    <ModalDialog
      title={props.title}
      footer={
        <div>
          <SubmitButton
            disabled={props.invalid}
            submitting={props.submitting}
            label={props.submitLabel}
          />
          <CloseDialogButton />
        </div>
      }
    >
      {props.loading ? (
        <LoadingSpinner />
      ) : (
        <FormContainer submitting={props.submitting} layout={props.layout}>
          {props.children}
        </FormContainer>
      )}

      <FieldError error={props.error} />
    </ModalDialog>
  </form>
);
