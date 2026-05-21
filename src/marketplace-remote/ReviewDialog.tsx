import { FC } from 'react';
import { Form } from 'react-final-form';

import { FormContainer, FormFooter, TextField } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface ReviewDialogProps {
  resolve: { refetch(): void; apiMethod; resource };
}

export const ReviewDialog: FC<ReviewDialogProps> = ({ resolve }) => {
  const mutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) =>
      resolve.apiMethod(resolve.resource.uuid, formData.review_comment),
    successMessage: translate('Review has been submitted.'),
    errorMessage: translate('Unable to submit review.'),
    refetch: resolve.refetch,
  });

  return (
    <Form
      onSubmit={(values) => mutation.mutateAsync(values)}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Review request')}
            footer={<FormFooter submitting={submitting} invalid={invalid} />}
          >
            <FormContainer submitting={submitting}>
              <TextField label={translate('Comment')} name="review_comment" />
            </FormContainer>
          </ModalDialog>
        </form>
      )}
    />
  );
};
