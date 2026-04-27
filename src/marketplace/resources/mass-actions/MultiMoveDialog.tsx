import { useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';
import { marketplaceResourcesMoveResource, Resource } from 'waldur-js-client';

import { FormContainer, FormFooter } from '@/form';
import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';

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
          <FormFooter
            submitting={props.submitting}
            invalid={props.invalid}
            submitLabel={translate('Save')}
          />
        }
      >
        <FormContainer submitting={props.submitting}>
          <MoveToProjectAutocomplete isDisabled={props.submitting} />
        </FormContainer>
      </ModalDialog>
    </form>
  );
});
