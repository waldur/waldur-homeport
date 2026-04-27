import { ArrowRightIcon } from '@phosphor-icons/react';
import { FC, useCallback, useState } from 'react';
import { invoicesImportUsage } from 'waldur-js-client';

import { ProgressStep } from '@/core/ProgressSteps';
import { WizardFormContainer } from '@/form/WizardFormContainer';
import { formatJsxTemplate, translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { showError, showSuccess } from '@/store/notify';

import { Step1UploadFile } from './Step1UploadFile';
import { Step2ColumnMapping } from './Step2ColumnMapping';
import { Step3PreviewAndImport } from './Step3PreviewAndImport';
import { ExcelParseResult, UsageImportRow } from './types';
import { COMPONENT_USAGE_IMPORT_FORM_ID } from './utils';

interface ComponentUsageImportDialogProps {
  resolve: {
    refetch?: () => void;
  };
}

const WizardForms = [
  Step1UploadFile,
  Step2ColumnMapping,
  Step3PreviewAndImport,
];

const steps: ProgressStep[] = [
  {
    key: 'upload',
    label: translate('Upload file'),
    completed: false,
  },
  {
    key: 'mapping',
    label: translate('Map columns'),
    completed: false,
  },
  {
    key: 'preview',
    label: translate('Preview & import'),
    completed: false,
  },
];

export const ComponentUsageImportDialog: FC<ComponentUsageImportDialogProps> = (
  props,
) => {
  const [parseResult, setParseResult] = useState<ExcelParseResult | null>(null);

  const handleFileParsed = useCallback((result: ExcelParseResult) => {
    setParseResult(result);
  }, []);

  const submitForm = useCallback(
    async (formData, dispatch, formProps) => {
      try {
        const mappedData: UsageImportRow[] = formData.mappedData || [];
        const year = formData.year?.value;
        const month = formData.month?.value;

        if (!year || !month) {
          dispatch(showError(translate('Please select a billing period')));
          return;
        }

        // Filter only ready rows (skip errors and zero values)
        const readyRows = mappedData.filter((row) => row.status === 'ready');

        if (readyRows.length === 0) {
          dispatch(showError(translate('No valid items to import')));
          return;
        }

        const payload = {
          year,
          month,
          items: readyRows.map((row) => ({
            customer_name: row.customerName,
            customer_uuid: row.customerUuid,
            name: row.itemName,
            unit_price: String(row.amount),
            ...(row.articleCode ? { article_code: row.articleCode } : {}),
            ...(row.serviceProviderName
              ? { service_provider_name: row.serviceProviderName }
              : {}),
            ...(row.offeringName ? { offering_name: row.offeringName } : {}),
            ...(row.planName ? { plan_name: row.planName } : {}),
          })),
        };

        const result = (await invoicesImportUsage({ body: payload })).data;

        if (result.created > 0) {
          dispatch(
            showSuccess(
              translate('Successfully imported {n} items', {
                n: result.created,
              }),
            ),
          );
        }

        if (result.errors?.length > 0) {
          dispatch(
            showError(
              translate('{n} items failed to import', {
                n: result.errors.length,
              }),
            ),
          );
        }

        if (result.created > 0 && !result.errors?.length) {
          props.resolve?.refetch?.();
          formProps.destroy();
          dispatch(closeModalDialog());
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : translate('Failed to import usage data');
        dispatch(showError(message));
      }
    },
    [props.resolve],
  );

  return (
    <WizardFormContainer
      form={COMPONENT_USAGE_IMPORT_FORM_ID}
      onSubmit={submitForm}
      steps={steps}
      hideStepper={false}
      title={translate('Import component usage')}
      subtitle={translate(
        'Upload Excel file {arrow} map columns {arrow} preview & import',
        { arrow: <ArrowRightIcon weight="bold" /> },
        formatJsxTemplate,
      )}
      wizardForms={WizardForms}
      submitLabel={translate('Import')}
      initialValues={{
        mappedData: [],
      }}
      data={{ parseResult, onFileParsed: handleFileParsed }}
      modalProps={{ bodyClassName: 'h-500px' }}
    />
  );
};
