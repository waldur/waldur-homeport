import { reduxForm } from 'redux-form';

import { FormContainer, FormFooter, TextField } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface OwnProps {
  resolve: { refetch(): void; apiMethod; resource };
}

const enhance = reduxForm<{}, OwnProps>({
  form: 'ReviewDialog',
});

export const ReviewDialog = enhance(
  ({ resolve, invalid, submitting, handleSubmit }) => {
    const setRoutesMutation = useManagedMutation<any, any, any>({
      mutationFn: (formData) =>
        resolve.apiMethod(resolve.resource.uuid, formData.review_comment),
      successMessage: translate('Review has been submitted.'),
      errorMessage: translate('Unable to submit review.'),
      refetch: resolve.refetch,
    });

    return (
      <form
        onSubmit={handleSubmit((values) =>
          setRoutesMutation.mutateAsync(values),
        )}
      >
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
