import { useRouter } from '@uirouter/react';
import { FC, useMemo, useState } from 'react';
import { Form } from 'react-final-form';
import {
  CallImportResponse,
  proposalProtectedCallsImportCall,
} from 'waldur-js-client';

import { AlertItem, BaseButton } from 'waldur-ui';

import { format } from '@/core/ErrorMessageFormatter';
import { required } from '@/core/validators';
import { BooleanGroup, StringGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { CallFileUpload, ParsedCallFile } from './CallFileUpload';
import {
  CallTransferSection,
  getPresentSections,
  getSectionDescription,
  getSectionLabel,
  sectionFlags,
} from './sections';

interface ImportCallDialogProps {
  resolve: {
    managerUuid: string;
    refetch?(): void;
  };
}

type FormValues = { name: string } & Partial<
  Record<CallTransferSection, boolean>
>;

/** The call an import created, with what it could not match on this portal. */
export const ImportCallResult: FC<{ result: CallImportResponse }> = ({
  result,
}) => {
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
        <div className="min-w-[150px]">
          <BaseButton
            variant="primary"
            label={translate('Open call')}
            onClick={openCall}
            className="w-full"
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
  const [parsed, setParsed] = useState<ParsedCallFile | null>(null);
  const sections = useMemo(
    () => (parsed ? getPresentSections(parsed.data) : []),
    [parsed],
  );
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

  if (result) {
    return <ImportCallResult result={result} />;
  }

  const exportedName = (parsed?.data.call as { name?: string } | undefined)
    ?.name;

  return (
    <Form<FormValues>
      key={parsed?.file.name}
      onSubmit={(values) => mutation.mutateAsync(values).catch(() => undefined)}
      initialValues={{
        name: exportedName ?? '',
        ...Object.fromEntries(sections.map((section) => [section, true])),
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
                <div className="min-w-[150px]">
                  <CloseDialogButton
                    label={translate('Cancel')}
                    className="w-full"
                  />
                </div>
                <div className="min-w-[150px]">
                  <SubmitButton
                    submitting={submitting || mutation.isPending}
                    label={translate('Import')}
                    invalid={invalid || !parsed}
                    className="w-full"
                  />
                </div>
              </>
            }
          >
            <CallFileUpload value={parsed} onChange={setParsed} />

            {mutation.error && (
              <AlertItem
                variant="error"
                type="floating"
                className="mt-3"
                title={translate('Unable to import call.')}
                body={format(mutation.error)}
              />
            )}

            {parsed && (
              <div className="mt-5">
                <StringGroup
                  name="name"
                  validate={required}
                  label={translate('Call name')}
                  required
                />
                {sections.length > 0 && (
                  <h5 className="mb-3">{translate('Import options')}</h5>
                )}
                {sections.map((section) => (
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
