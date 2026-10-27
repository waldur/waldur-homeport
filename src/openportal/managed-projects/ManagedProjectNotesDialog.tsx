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
              <div className="flex flex-col gap-1.5 mb-2.5">
                {notes.map((note, index) => (
                  <div
                    key={index}
                    className="border-b-[1px] border-b-secondary pb-1.5"
                  >
                    <div className="text-quaternary small">
                      {note.author} &middot; {formatDateTime(note.timestamp)}
                    </div>
                    <div>{note.text}</div>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-quaternary block mb-2.5">
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
