import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  RoundMeetingNote,
  roundMeetingNotesCreate,
  roundMeetingNotesPartialUpdate,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import {
  BooleanGroup,
  FileUploadGroup,
  StringGroup,
  SubmitButton,
  TextGroup,
} from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface MeetingNoteFormDialogProps {
  resolve: {
    roundUuid: string;
    roundName: string;
    note?: RoundMeetingNote;
    refetch(): void;
  };
}

interface NoteFormValues {
  title?: string;
  body?: string;
  document?: File | null;
  remove?: Record<string, boolean>;
}

/**
 * Record what a committee or panel concluded on the round as a whole: a
 * title, the notes and documents such as the minutes.
 */
export const MeetingNoteFormDialog: FC<MeetingNoteFormDialogProps> = ({
  resolve: { roundUuid, roundName, note, refetch },
}) => {
  const initialValues = useMemo<NoteFormValues>(
    () => ({ title: note?.title ?? '', body: note?.body ?? '' }),
    [note],
  );

  const save = useManagedMutation<any, any, NoteFormValues>({
    mutationFn: (values) => {
      const newDocuments = values.document ? [values.document] : [];
      const removed = Object.entries(values.remove ?? {})
        .filter(([, checked]) => checked)
        .map(([uuid]) => uuid);
      if (note) {
        return roundMeetingNotesPartialUpdate({
          path: { uuid: note.uuid },
          body: {
            title: values.title,
            body: values.body ?? '',
            ...(newDocuments.length ? { new_documents: newDocuments } : {}),
            ...(removed.length ? { removed_documents: removed } : {}),
          },
        });
      }
      return roundMeetingNotesCreate({
        body: {
          round: roundUuid,
          title: values.title as string,
          body: values.body ?? '',
          ...(newDocuments.length ? { new_documents: newDocuments } : {}),
        },
      });
    },
    successMessage: note
      ? translate('The meeting note has been updated.')
      : translate('The meeting note has been added.'),
    errorMessage: translate('Unable to save the meeting note.'),
    refetch,
  });

  return (
    <Form<NoteFormValues>
      onSubmit={(values) => save.mutateAsync(values)}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              note
                ? translate('Edit meeting note')
                : translate('Add meeting note to {round}', { round: roundName })
            }
            subtitle={translate(
              "Feedback of the committee or panel on the round's cut-off. Read by the call's managers and panel members, never by applicants or reviewers.",
            )}
            footer={
              <>
                <CloseDialogButton variant="tertiary" />
                <SubmitButton
                  submitting={submitting}
                  disabled={invalid}
                  label={translate('Save')}
                />
              </>
            }
          >
            <StringGroup
              name="title"
              label={translate('Title')}
              required
              validate={required}
              maxLength={255}
              placeholder={translate(
                'For example, committee meeting of 12 May',
              )}
            />
            <TextGroup name="body" label={translate('Notes')} rows={8} />
            {note?.documents?.length ? (
              <div className="mb-4">
                <div className="font-medium mb-1.5">
                  {translate('Remove documents')}
                </div>
                {note.documents.map((document) => (
                  <BooleanGroup
                    key={document.uuid}
                    name={`remove.${document.uuid}`}
                    label={document.name}
                    hideLabel
                  />
                ))}
              </div>
            ) : null}
            <FileUploadGroup
              name="document"
              label={translate('Attach document')}
              showFileName
              buttonLabel={translate('Browse')}
              variant="tertiary"
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
