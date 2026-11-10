import React, { PropsWithChildren } from 'react';

import { ButtonVariant } from 'waldur-ui';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { FieldError, FormFooter } from '@/form';

import { ModalDialog } from './ModalDialog';

interface ActionDialogProps {
  title?: string;
  subtitle?: React.ReactNode;
  submitLabel?: string;
  submitVariant?: ButtonVariant;
  submitting?: boolean;
  loading?: boolean;
  invalid?: boolean;
  submitDisabled?: boolean;
  submitDisabledReason?: string;
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
      subtitle={props.subtitle}
      footer={
        <FormFooter
          submitLabel={props.submitLabel}
          submitVariant={props.submitVariant}
          fullWidth={props.fullButtons}
          submitDisabled={props.submitDisabled}
          submitDisabledReason={props.submitDisabledReason}
        />
      }
    >
      {props.loading ? <LoadingSpinner /> : <div>{props.children}</div>}

      <FieldError error={props.error} />
    </ModalDialog>
  </form>
);
