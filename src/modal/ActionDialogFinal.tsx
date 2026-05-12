import React, { PropsWithChildren } from 'react';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SubmitButton, FormContainerFinal, FieldError } from '@/form';

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

export const ActionDialogFinal: React.FC<
  PropsWithChildren<ActionDialogProps>
> = (props) => (
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
        <FormContainerFinal submitting={props.submitting} className="col-l">
          {props.children}
        </FormContainerFinal>
      )}

      <FieldError error={props.error} />
    </ModalDialog>
  </form>
);
