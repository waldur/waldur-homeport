import { useRouter } from '@uirouter/react';
import { FC, useCallback, useState } from 'react';
import { Form } from 'react-final-form';
import {
  CallImportResponse,
  proposalProtectedCallsImportCall,
} from 'waldur-js-client';

import { AlertItem, BaseButton } from 'waldur-ui';

import { format } from '@/core/ErrorMessageFormatter';
import { required } from '@/core/validators';
import { BooleanGroup, StringGroup, SubmitButton } from '@/form';
import { AttachmentItem } from '@/form/upload/AttachmentItem';
import { UploadContainer } from '@/form/upload/UploadContainer';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { MAX_CALL_EXPORT_SIZE, parseCallExport } from './callExportYaml';
import {
  CallTransferSection,
  getPresentSections,
  getSectionDescription,
  getSectionLabel,
  sectionFlags,
} from './sections';

const EXPORT_FILE_TYPES = {
  'application/json': ['.json'],
  'text/yaml': ['.yaml', '.yml'],
  'application/yaml': ['.yaml', '.yml'],
  'application/x-yaml': ['.yaml', '.yml'],
};

interface ImportCallDialogProps {
  resolve: {
    managerUuid: string;
    refetch?(): void;
  };
}

type FormValues = { name: string } & Partial<
  Record<CallTransferSection, boolean>
>;

interface ParsedFile {
  file: File;
  data: Record<string, unknown>;
  sections: CallTransferSection[];
}

const ImportResult: FC<{ result: CallImportResponse }> = ({ result }) => {
  const router = useRouter();
  const { closeDialog } = useModal();
  const openCall = () => {
    closeDialog();
    router.stateService.go('protected-call.main', {
      call_uuid: result.call_uuid,
    });
  };
  return (
    <ModalDialog
      title={translate('Call imported')}
      subtitle={translate(
        '{name} was created as a draft. Some parts could not be matched on this portal and were skipped:',
        { name: result.call_name },
      )}
      footer={
        <div className="min-w-150px">
          <BaseButton
            variant="primary"
            label={translate('Open call')}
            onClick={openCall}
            className="w-100"
          />
        </div>
      }
    >
      <ul className="mb-0" data-testid="import-call-warnings">
        {result.warnings.map((warning, index) => (
          // The same warning can repeat, e.g. one checklist on several steps.

          <li key={index}>{warning}</li>
        ))}
      </ul>
    </ModalDialog>
  );
};

export const ImportCallDialog: FC<ImportCallDialogProps> = ({ resolve }) => {
  const router = useRouter();
  const { closeDialog } = useModal();
  const [parsed, setParsed] = useState<ParsedFile | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [result, setResult] = useState<CallImportResponse | null>(null);

  const mutation = useManagedMutation({
    mutationFn: async (values: FormValues) => {
      const response = await proposalProtectedCallsImportCall({
        body: {
          manager: resolve.managerUuid,
          name: values.name,
          call_data: parsed.data,
          ...sectionFlags('import_', values),
        },
      });
      return response.data;
    },
    // Warnings have to be read before the dialog goes away.
    closeModal: false,
    refetch: resolve.refetch,
    onSuccess: (data) => {
      if (data.warnings.length) {
        setResult(data);
        return;
      }
      closeDialog();
      router.stateService.go('protected-call.main', {
        call_uuid: data.call_uuid,
      });
    },
    successMessage: translate('Call imported as a draft.'),
  });

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    try {
      const data = parseCallExport(await file.text());
      setParsed({ file, data, sections: getPresentSections(data) });
      setFileError(null);
    } catch (error) {
      setParsed(null);
      setFileError(error.message);
    }
  }, []);

  const onDropRejected = useCallback(() => {
    setParsed(null);
    setFileError(
      translate(
        'The file is larger than 10 MB, the most a portal accepts. Export the call again without documents and attach them after the import.',
      ),
    );
  }, []);

  if (result) {
    return <ImportResult result={result} />;
  }

  const exportedName = (parsed?.data.call as { name?: string } | undefined)
    ?.name;

  return (
    <Form<FormValues>
      key={parsed?.file.name}
      onSubmit={(values) => mutation.mutateAsync(values).catch(() => undefined)}
      initialValues={{
        name: exportedName ?? '',
        ...Object.fromEntries(
          (parsed?.sections ?? []).map((section) => [section, true]),
        ),
      }}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Import call')}
            subtitle={translate(
              'Create a draft call from a file exported on this or another portal.',
            )}
            footer={
              <>
                <div className="min-w-150px">
                  <CloseDialogButton
                    label={translate('Cancel')}
                    className="w-100"
                  />
                </div>
                <div className="min-w-150px">
                  <SubmitButton
                    submitting={submitting || mutation.isPending}
                    label={translate('Import')}
                    invalid={invalid || !parsed}
                    className="w-100"
                  />
                </div>
              </>
            }
          >
            {parsed ? (
              <AttachmentItem
                attachment={{
                  file: parsed.file,
                  file_name: parsed.file.name,
                  file_size: parsed.file.size,
                  mime_type: parsed.file.type,
                }}
                onDelete={() => setParsed(null)}
              />
            ) : (
              <UploadContainer
                onDrop={onDrop}
                message={translate(
                  'Call export file (.yaml, .yml or .json, max. 10 MB)',
                )}
                onDropRejected={onDropRejected}
                maxSize={MAX_CALL_EXPORT_SIZE}
                accept={EXPORT_FILE_TYPES}
                multiple={false}
              />
            )}

            {fileError && (
              <AlertItem
                variant="error"
                type="floating"
                className="mt-4"
                title={fileError}
              />
            )}

            {mutation.error && (
              <AlertItem
                variant="error"
                type="floating"
                className="mt-4"
                title={translate('Unable to import call.')}
                body={format(mutation.error)}
              />
            )}

            {parsed && (
              <div className="mt-6">
                <StringGroup
                  name="name"
                  validate={required}
                  label={translate('Call name')}
                  required
                />
                {parsed.sections.length > 0 && (
                  <h5 className="mb-4">{translate('Import options')}</h5>
                )}
                {parsed.sections.map((section) => (
                  <BooleanGroup
                    key={section}
                    name={section}
                    label={getSectionLabel(section)}
                    description={getSectionDescription(section)}
                  />
                ))}
              </div>
            )}
          </ModalDialog>
        </form>
      )}
    />
  );
};
