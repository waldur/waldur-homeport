import * as React from 'react';

import { SubmitButton, FormContainer, FieldError } from '@waldur/form-react';

import { CloseDialogButton } from './CloseDialogButton';
import { ModalDialog } from './ModalDialog';

export const ActionDialog = props => (
  <ModalDialog
    title={props.title}
    footer={
      <form onSubmit={props.onSubmit}>
        <SubmitButton submitting={props.submitting} label={props.submitLabel}/>
        <CloseDialogButton/>
      </form>
    }>
    <FormContainer submitting={props.submitting}>
      {props.children}
    </FormContainer>
    <FieldError error={props.error}/>
  </ModalDialog>
);
