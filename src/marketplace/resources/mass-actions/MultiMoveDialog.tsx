import { useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';
import { marketplaceResourcesMoveResource, Resource } from 'waldur-js-client';

import { FormContainer, SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { MoveToProjectAutocomplete } from '../actions/MoveToProjectAutocomplete';

interface MultiMoveDialogOwnProps {
  resolve: {
    rows: Resource[];
    refetch?(): void;
  };
}

interface FormData {
  project: { name: string; customer_name: string; url: string };
}

export const MultiMoveDialog = reduxForm<FormData, MultiMoveDialogOwnProps>({
  form: 'MultiMoveDialog',
})((props) => {
  const dispatch = useDispatch();
  const submitRequest = (formData: FormData) => {
    Promise.all(
      props.resolve.rows.map((row) =>
        marketplaceResourcesMoveResource({
          path: { uuid: row.uuid },
          // @ts-ignore
          body: {
            project: {
              url: formData.project.url,
            },
          },
        }),
      ),
    ).then(() => {
      props.resolve.refetch();
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
});
