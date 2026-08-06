import { Form } from 'react-final-form';
import {
  ManagedProject,
  openportalManagedProjectsAddNote,
} from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { required } from '@/core/validators';
import { SubmitButton, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface FormValues {
  text: string;
}

interface ManagedProjectNotesDialogProps {
  row: ManagedProject;
  resolve: {
    refetch: () => Promise<void> | void;
  };
}

export const ManagedProjectNotesDialog: React.FC<
  ManagedProjectNotesDialogProps
> = ({ row, resolve }) => {
  const notes = row.details?.notes ?? [];

  const addNoteMutation = useManagedMutation<any, any, FormValues>({
    mutationFn: (values) =>
      openportalManagedProjectsAddNote({
        path: { identifier: row.identifier, destination: row.destination },
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
            title={translate('Notes')}
            footer={
              <SubmitButton
                submitting={submitting}
                invalid={invalid}
                label={translate('Add note')}
              />
            }
          >
            {notes.length > 0 ? (
              <div className="d-flex flex-column gap-2 mb-3">
                {notes.map((note, index) => (
                  <div key={index} className="border-bottom pb-2">
                    <div className="text-muted small">
                      {note.author} &middot; {formatDateTime(note.timestamp)}
                    </div>
                    <div>{note.text}</div>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-muted d-block mb-3">
                {translate('No notes yet.')}
              </span>
            )}
            <TextGroup
              name="text"
              label={translate('New note')}
              validate={required}
              required
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
