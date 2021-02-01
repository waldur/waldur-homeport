import { FunctionComponent } from 'react';
import { InjectedFormProps } from 'redux-form';

import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { TerminateDialogOwnProps } from './types';

interface DispatchProps {
  submitRequest(): void;
}

interface StateProps {
  orderCanBeApproved: boolean;
}

type TerminateDialogProps = TerminateDialogOwnProps &
  DispatchProps &
  StateProps &
  InjectedFormProps;

export const TerminateDialog: FunctionComponent<TerminateDialogProps> = (
  props,
) => (
  <form onSubmit={props.handleSubmit(props.submitRequest)}>
    <ModalDialog
      title={translate('Terminate resource {resourceName}', {
        resourceName: props.asyncState?.value?.name,
      })}
      footer={
        <>
          <CloseDialogButton />
          <SubmitButton
            submitting={props.submitting}
            label={
              props.orderCanBeApproved
                ? translate('Submit')
                : translate('Request for a termination')
            }
            className="btn btn-danger"
          />
        </>
      }
    >
      {translate(
        'Are you sure you would like to terminate resource {resourceName}?',
        {
          resourceName: props.asyncState?.value?.name,
        },
      )}
      {props.dialogSubtitle && <FormattedHtml html={props.dialogSubtitle} />}
    </ModalDialog>
  </form>
);
