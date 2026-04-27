import { useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';

import { FormContainer, FormFooter, TextField } from '@/form';
import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@/store/notify';

interface OwnProps {
  resolve: { refetch(): void; apiMethod; resource };
}

const enhance = reduxForm<{}, OwnProps>({
  form: 'ReviewDialog',
});

export const ReviewDialog = enhance(
  ({ resolve, invalid, submitting, handleSubmit }) => {
    const dispatch = useDispatch();
    const setRoutes = async (formData) => {
      try {
        await resolve.apiMethod(resolve.resource.uuid, formData.review_comment);
        resolve.refetch();
        dispatch(showSuccess(translate('Review has been submitted.')));
        dispatch(closeModalDialog());
      } catch (e) {
        dispatch(showErrorResponse(e, translate('Unable to submit review.')));
      }
    };

    return (
      <form onSubmit={handleSubmit(setRoutes)}>
        <ModalDialog
          title={translate('Review request')}
          footer={<FormFooter submitting={submitting} invalid={invalid} />}
        >
          <FormContainer submitting={submitting}>
            <TextField label={translate('Comment')} name="review_comment" />
          </FormContainer>
        </ModalDialog>
      </form>
    );
  },
);
