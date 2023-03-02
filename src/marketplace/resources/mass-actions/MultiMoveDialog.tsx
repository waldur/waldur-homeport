import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';

import { FormContainer, SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { moveResource } from '@waldur/marketplace/common/api';
import { Resource } from '@waldur/marketplace/resources/types';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { MoveToProjectAutocomplete } from '../actions/MoveToProjectAutocomplete';

interface MultiMoveDialogOwnProps {
  rows: Resource[];
  refetch?(): void;
}

interface FormData {
  project: { name: string; customer_name: string; url: string };
}

const PureMultiMoveDialog: FunctionComponent<any> = (props) => {
  const dispatch = useDispatch();
  const submitRequest = (formData: FormData) => {
    Promise.all(
      props.resolve.rows.forEach((row) =>
        moveResource(row.uuid, formData.project.url),
      ),
    ).then(() => {
      props.refetch();
      dispatch(closeModalDialog());
    });
  };

  return (
    <form onSubmit={props.handleSubmit(submitRequest)}>
      <ModalDialog
        title={translate('Mass move resources')}
        footer={
          <>
            <CloseDialogButton />
            <SubmitButton
              submitting={props.submitting}
              label={translate('Save')}
              disabled={props.invalid}
            />
          </>
        }
      >
        <FormContainer submitting={props.submitting}>
          <MoveToProjectAutocomplete isDisabled={props.submitting} />
        </FormContainer>
      </ModalDialog>
    </form>
  );
};

export const MultiMoveDialog = reduxForm<FormData, MultiMoveDialogOwnProps>({
  form: 'MultiMoveDialog',
})(PureMultiMoveDialog);
