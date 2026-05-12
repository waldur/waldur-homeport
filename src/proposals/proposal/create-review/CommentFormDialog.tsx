import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';

import { required } from '@/core/validators';
import { SubmitButton, TextField } from '@/form';
import { FormContainerFinal } from '@/form/FormContainerFinal';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

interface CommentFormDialogProps {
  resolve: { title?: string; onSubmit; value?: string };
}

interface FormData {
  comment: string;
}

export const CommentFormDialog: FC<CommentFormDialogProps> = (props) => {
  const initialValues = useMemo(
    () => ({ comment: props.resolve.value }),
    [props.resolve.value],
  );

  return (
    <Form<FormData>
      onSubmit={props.resolve.onSubmit}
      initialValues={initialValues}
      render={({ handleSubmit, invalid, submitting, pristine }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              props.resolve.title
                ? translate('Comment about "{name}"', {
                    name: props.resolve.title,
                  })
                : translate('Add comment')
            }
            subtitle={
              props.resolve.title
                ? translate('Please add a comment for the "{name}"', {
                    name: props.resolve.title,
                  })
                : null
            }
            footer={
              <>
                <CloseDialogButton variant="tertiary" className="flex-equal" />

                <SubmitButton
                  disabled={invalid || pristine}
                  submitting={submitting}
                  label={translate('Confirm')}
                  className="btn btn-primary flex-equal"
                />
              </>
            }
          >
            <FormContainerFinal submitting={submitting}>
              <TextField
                label={translate('Comment')}
                placeholder={translate('Enter a comment...')}
                name="comment"
                required
                validate={required}
                hideLabel
                spaceless
              />
            </FormContainerFinal>
          </ModalDialog>
        </form>
      )}
    />
  );
};
