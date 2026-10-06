import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  proposalProtectedCallsRoundsRecordAdoption,
  ProtectedRound,
} from 'waldur-js-client';

import { formatISODate } from '@/core/dateUtils';
import { required } from '@/core/validators';
import { DateGroup, FileUploadGroup, SubmitButton, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Call } from '@/proposals/types';

interface RecordRoundAdoptionDialogProps {
  resolve: {
    round: ProtectedRound;
    call: Call;
    refetch(): void;
  };
}

interface AdoptionFormValues {
  adopted_at?: string | Date;
  adoption_note?: string;
  adoption_document?: File | null;
}

/**
 * Records that the body entitled to adopt the round's results did so: the
 * date, a note and optionally the adopting document. Recording it again
 * replaces the date and note; the document is kept unless a new one is
 * chosen.
 */
export const RecordRoundAdoptionDialog: FC<RecordRoundAdoptionDialogProps> = ({
  resolve: { round, call, refetch },
}) => {
  const initialValues = useMemo<AdoptionFormValues>(
    () => ({
      adopted_at: round.adopted_at ?? undefined,
      adoption_note: round.adoption_note ?? '',
    }),
    [round.adopted_at, round.adoption_note],
  );

  const record = useManagedMutation<any, any, AdoptionFormValues>({
    mutationFn: (values) =>
      proposalProtectedCallsRoundsRecordAdoption({
        path: { uuid: call.uuid, obj_uuid: round.uuid },
        body: {
          adopted_at: formatISODate(values.adopted_at),
          adoption_note: values.adoption_note ?? '',
          ...(values.adoption_document
            ? { adoption_document: values.adoption_document }
            : {}),
        },
      }),
    successMessage: translate('The adoption has been recorded.'),
    errorMessage: translate('Unable to record the adoption.'),
    refetch,
  });

  return (
    <Form<AdoptionFormValues>
      onSubmit={(values) => record.mutateAsync(values)}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Record adoption of {name}', {
              name: round.name,
            })}
            subtitle={translate(
              "When and how the round's results were adopted by the body entitled to adopt them.",
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
            <DateGroup
              name="adopted_at"
              label={translate('Adopted on')}
              required
              validate={required}
            />
            <TextGroup
              name="adoption_note"
              label={translate('Note')}
              maxLength={2000}
              placeholder={translate('For example, the decision reference')}
            />
            <FileUploadGroup
              name="adoption_document"
              label={translate('Adopting document')}
              description={
                round.adoption_document
                  ? translate(
                      'A document is already recorded. Choose a file only to replace it.',
                    )
                  : undefined
              }
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
