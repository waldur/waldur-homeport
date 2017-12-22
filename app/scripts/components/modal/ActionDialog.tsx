import * as React from 'react';

import { SubmitButton, FormContainer, FieldError } from '@waldur/form-react';

import { CloseDialogButton } from './CloseDialogButton';
import { ModalDialog } from './ModalDialog';

export const ActionDialog = props => (
  <form onSubmit={props.onSubmit}>
    <ModalDialog
      title={props.title}
      footer={
        <div>
          <SubmitButton submitting={props.submitting} label={props.submitLabel}/>
          <CloseDialogButton/>
        </div>
      }>
      <FormContainer submitting={props.submitting}>
        {props.children}
      </FormContainer>
      <FieldError error={props.error}/>
    </ModalDialog>
  </form>
);
