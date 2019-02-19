import * as React from 'react';
import { InjectedFormProps } from 'redux-form';

import { SubmitButton } from '@waldur/form-react';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

export interface OwnProps {
  resolve: {
    resource: {
      name: string;
      marketplace_resource_uuid: string;
    };
  };
}

interface DispatchProps {
  submitRequest(): void;
}

interface StateProps {
  orderCanBeApproved: boolean;
}

type TerminateDialogProps = OwnProps & DispatchProps & StateProps & InjectedFormProps;

export const PureTerminateDialog = (props: TerminateDialogProps) => (
  <form onSubmit={props.handleSubmit(props.submitRequest)}>
    <ModalDialog
      title={translate('Terminate resource {resourceName}', {
        resourceName: props.resolve.resource.name,
      })}
      footer={
        <>
          <CloseDialogButton/>
          <SubmitButton
            submitting={props.submitting}
            label={props.orderCanBeApproved ? translate('Submit') : translate('Request for a termination')}
            className="btn btn-danger"
          />
        </>
      }>
      {translate('Are you sure you would like to terminate resource {resourceName}?', {
        resourceName: props.resolve.resource.name,
      })}
    </ModalDialog>
  </form>
);
