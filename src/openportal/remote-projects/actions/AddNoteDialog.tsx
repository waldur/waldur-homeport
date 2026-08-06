import { Form } from 'react-final-form';
import {
  RemoteProject,
  openportalRemoteProjectsAddNote,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { SubmitButton, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface FormValues {
  text: string;
}

interface AddNoteDialogProps {
  row: RemoteProject;
  resolve: {
    refetch: () => Promise<void> | void;
  };
}

export const AddNoteDialog: React.FC<AddNoteDialogProps> = ({
  row,
  resolve,
}) => {
  const addNoteMutation = useManagedMutation<any, any, FormValues>({
    mutationFn: (values) =>
      // The author is recorded from the authenticated user server-side.
      openportalRemoteProjectsAddNote({
        path: { uuid: row.uuid },
        body: { text: values.text },
      }),
    successMessage: translate('Note has been added.'),
    errorMessage: translate('Unable to add note.'),
    refetch: resolve.refetch,
  });

  return (
    <Form<FormValues>
      onSubmit={(values) => addNoteMutation.mutateAsync(values)}
      subscription={{ submitting: true, invalid: true }}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit} noValidate>
          <ModalDialog
            title={translate('Add note')}
            footer={
              <SubmitButton
                submitting={submitting}
                invalid={invalid}
                label={translate('Add note')}
              />
            }
          >
            <TextGroup
              name="text"
              label={translate('Note text')}
              validate={required}
              required
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
