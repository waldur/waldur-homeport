import { FC } from 'react';
import { Form } from 'react-final-form';
import { proposalProtectedCallsExportCall } from 'waldur-js-client';

import { BooleanGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useNotify } from '@/store/notify';
import { saveFile } from '@/table/exporters/saveFile';

import { Call } from '../types';

import {
  callExportFileName,
  MAX_CALL_EXPORT_SIZE,
  renderCallExportYaml,
} from './callExportYaml';
import {
  CALL_TRANSFER_SECTIONS,
  CallTransferSection,
  getSectionDescription,
  getSectionLabel,
  sectionFlags,
} from './sections';

interface ExportCallDialogProps {
  resolve: { call: Pick<Call, 'uuid' | 'name'> };
}

type FormValues = Record<CallTransferSection, boolean>;

const initialValues = Object.fromEntries(
  CALL_TRANSFER_SECTIONS.map((section) => [section, true]),
) as FormValues;

export const ExportCallDialog: FC<ExportCallDialogProps> = ({ resolve }) => {
  const { showRedirectMessage: showWarning } = useNotify();
  const mutation = useManagedMutation({
    mutationFn: async (values: FormValues) => {
      const response = await proposalProtectedCallsExportCall({
        path: { uuid: resolve.call.uuid },
        body: sectionFlags('include_', values),
      });
      const blob = new Blob([renderCallExportYaml(response.data.export_data)], {
        type: 'text/yaml',
      });
      saveFile(blob, callExportFileName(response.data.call_name));
      if (response.data.warnings.length) {
        showWarning(
          translate('Some parts were left out of the export'),
          response.data.warnings.join(' '),
        );
      }
      if (blob.size > MAX_CALL_EXPORT_SIZE) {
        showWarning(
          translate('The export is too large to import'),
          translate(
            'Portals accept call files up to 10 MB. Export again without documents and attach them to the imported call.',
          ),
        );
      }
      return response;
    },
    successMessage: translate('Call exported as YAML.'),
    errorMessage: translate('Unable to export call.'),
  });

  return (
    <Form<FormValues>
      onSubmit={(values) => mutation.mutateAsync(values)}
      initialValues={initialValues}
      render={({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Export call')}
            subtitle={translate(
              'Download the call configuration to import it on another portal. Call settings are always included; proposals, reviews and people never are.',
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
                    label={translate('Export')}
                    className="w-100"
                  />
                </div>
              </>
            }
          >
            {CALL_TRANSFER_SECTIONS.map((section) => (
              <BooleanGroup
                key={section}
                name={section}
                label={getSectionLabel(section)}
                description={getSectionDescription(section)}
              />
            ))}
          </ModalDialog>
        </form>
      )}
    />
  );
};
