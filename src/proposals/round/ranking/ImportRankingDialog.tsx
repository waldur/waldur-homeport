import { FORM_ERROR } from 'final-form';
import { FC } from 'react';
import { Form } from 'react-final-form';
import { proposalRankingsImportCsv } from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { getErrorBody } from '@/core/ErrorMessageFormatter';
import { required } from '@/core/validators';
import { FileUploadGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { roundRankingsKey } from './rankings';

interface ImportRankingDialogProps {
  resolve: {
    roundUuid: string;
    roundName: string;
    /** Import the ranking of this round report rather than the overall one. */
    meetingNoteUuid?: string;
    refetch(): void;
  };
}

interface ImportFormValues {
  file?: File | null;
}

const asText = (value: unknown): string[] => {
  if (value == null) return [];
  if (Array.isArray(value)) return value.flatMap(asText);
  if (typeof value === 'object') return Object.values(value).flatMap(asText);
  return [String(value)];
};

/**
 * The reasons a refused import gives -- a file too large, more rows than
 * the round has proposals, a bad row -- for the dialog to show: what is
 * about the file under the file field, anything else above it.
 */
export const importSubmissionErrors = (
  error: any,
): Record<string, string> | undefined => {
  if ((error?.status ?? error?.response?.status) !== 400) return undefined;
  const body = getErrorBody(error);
  if (!body) return undefined;
  const errors: Record<string, string> = {};
  const general: string[] = [];
  for (const [key, value] of Object.entries(body)) {
    if (key === 'file') {
      errors.file = asText(value).join(' ');
    } else {
      general.push(...asText(value));
    }
  }
  if (general.length) {
    errors[FORM_ERROR] = general.join(' ');
  }
  return Object.keys(errors).length ? errors : undefined;
};

/**
 * Create or update the round's ranking from a CSV in the export's format.
 * Ranks are checked across the round as it will be after the import, so a
 * file may reorder it; an error in any row saves nothing.
 */
export const ImportRankingDialog: FC<ImportRankingDialogProps> = ({
  resolve: { roundUuid, roundName, meetingNoteUuid, refetch },
}) => {
  const importFile = useManagedMutation<any, any, ImportFormValues>({
    mutationFn: (values) =>
      proposalRankingsImportCsv({
        body: {
          round: roundUuid,
          file: values.file as File,
          ...(meetingNoteUuid ? { meeting_note: meetingNoteUuid } : {}),
        },
      }),
    successMessage: translate('The ranking has been imported.'),
    errorMessage: translate('Unable to import the ranking.'),
    refetch,
    invalidateQueries: [{ queryKey: roundRankingsKey(roundUuid) }],
  });

  return (
    <Form<ImportFormValues>
      onSubmit={(values) =>
        importFile
          .mutateAsync(values)
          // The notification says it too; the dialog stays open with the
          // reason beside the file.
          .then(() => undefined)
          .catch((error) => importSubmissionErrors(error))
      }
      render={({
        handleSubmit,
        submitting,
        hasValidationErrors,
        submitError,
        dirtySinceLastSubmit,
      }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Import ranking of {round}', { round: roundName })}
            subtitle={translate(
              'Use the exported file: fill in rank, final score, notes and the recommended amounts. Rows without a rank are left out, and rankings not in the file stay as they are.',
            )}
            footer={
              <>
                <CloseDialogButton variant="tertiary" />
                <SubmitButton
                  submitting={submitting}
                  disabled={hasValidationErrors}
                  label={translate('Import')}
                />
              </>
            }
          >
            {submitError && !dirtySinceLastSubmit && (
              <AlertItem variant="error" title={submitError} className="mb-3" />
            )}
            <FileUploadGroup
              name="file"
              label={translate('CSV file')}
              required
              validate={required}
              accept=".csv,text/csv"
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
