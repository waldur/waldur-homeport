import React, { PropsWithChildren } from 'react';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { FormContainerFinal, FieldError, FormFooter } from '@/form';

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
        <FormFooter
          submitting={props.submitting}
          submitLabel={props.submitLabel}
          invalid={props.invalid}
          fullWidth={props.fullButtons}
        />
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
