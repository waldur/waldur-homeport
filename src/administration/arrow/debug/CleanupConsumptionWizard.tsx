import {
  CaretLeftIcon,
  CaretRightIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { FC, useMemo } from 'react';
import { useForm, useFormState } from 'react-final-form';
import {
  adminArrowBillingSyncsCleanupConsumption,
  type CleanupConsumptionResponse,
  type Resource,
} from 'waldur-js-client';

import {
  AlertItem,
  BaseButton,
  Checkbox,
  FormField,
  FormLabel,
  FormText,
  ProgressStep,
  RadioGroup,
} from 'waldur-ui';
import {
  Wizard,
  WizardFooterRenderProps,
  WizardModal,
  WizardStepProps,
} from 'waldur-wizard';

import { formatMonth } from '@/core/dateUtils';
import { format } from '@/core/ErrorMessageFormatter';
import { AsyncSelect, Select } from '@/form/select';
import { translate } from '@/i18n';
import { resourceAutocomplete } from '@/marketplace/common/autocompletes';
import { CloseDialogButton } from '@/modal/CloseDialogButton';

import {
  arrowQueryKeys,
  useActiveVendorOfferingMappings,
  useArrowSettings,
} from '../api';

type Scope = 'all' | 'settled' | 'unsettled';

interface MonthChoice {
  label: string;
  /** YYYY-MM, as the endpoint takes it. */
  value: string;
}

interface CleanupValues {
  from: MonthChoice | null;
  to: MonthChoice | null;
  resource: Resource | null;
  scope: Scope;
  confirmed: boolean;
  preview: CleanupConsumptionResponse | null;
  result: CleanupConsumptionResponse | null;
}

const makeMonths = (): MonthChoice[] => {
  let date = DateTime.now().startOf('month');
  return Array.from({ length: 36 }, () => {
    const choice = {
      label: formatMonth(date.toJSDate()),
      value: date.toFormat('yyyy-MM'),
    };
    date = date.minus({ months: 1 });
    return choice;
  });
};

const SCOPES = () => [
  {
    value: 'all' as Scope,
    label: translate('All records'),
    description: translate('Settled and unsettled months alike.'),
  },
  {
    value: 'unsettled' as Scope,
    label: translate('Unsettled only'),
    description: translate(
      'Months whose final Arrow billing has not been compared yet.',
    ),
  },
  {
    value: 'settled' as Scope,
    label: translate('Settled only'),
    description: translate(
      "Months already compared with Arrow's final billing.",
    ),
  },
];

const cleanup = (values: CleanupValues, dryRun: boolean) =>
  adminArrowBillingSyncsCleanupConsumption({
    body: {
      ...(values.from ? { period_from: values.from.value } : {}),
      ...(values.to ? { period_to: values.to.value } : {}),
      ...(values.resource ? { resource_uuid: values.resource.uuid } : {}),
      only_finalized: values.scope === 'settled',
      only_unfinalized: values.scope === 'unsettled',
      dry_run: dryRun,
    },
  }).then((response) => response.data);

const StepError = ({ error }: { error: unknown }) =>
  error ? (
    <AlertItem
      type="floating"
      variant="error"
      className="mt-3"
      title={format(error) || translate('The request failed')}
    />
  ) : null;

const Kept = ({ report }: { report: CleanupConsumptionResponse }) =>
  report.records_kept_issued || report.records_kept_imported ? (
    <AlertItem
      type="floating"
      variant="info"
      className="mt-3"
      title={translate(
        '{issued} record(s) kept because their month is on an issued invoice, {imported} kept because an import settled their month.',
        {
          issued: report.records_kept_issued,
          imported: report.records_kept_imported,
        },
      )}
      body={translate(
        'Removing them would let the next sync bill those months again.',
      )}
    />
  ) : null;

const ChooseStep: FC<WizardStepProps> = (props) => {
  const form = useForm<CleanupValues>();
  const { values } = useFormState<CleanupValues>();
  const months: MonthChoice[] = props.data.months;
  const { data: settings } = useArrowSettings();
  const { data: vendorMappings } = useActiveVendorOfferingMappings(
    settings?.uuid,
  );
  const offeringUuids = useMemo(
    () =>
      Array.from(new Set((vendorMappings ?? []).map((m) => m.offering_uuid))),
    [vendorMappings],
  );
  const loadResources = useMemo(
    () =>
      resourceAutocomplete({
        field: ['name', 'uuid'],
        // One comma-separated value: the backend keeps only the last of
        // repeated params.
        offering_uuid: [offeringUuids.join(',')],
      }),
    [offeringUuids],
  );

  return (
    <WizardModal {...props}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
        <FormField className="mb-3">
          <FormLabel>{translate('From month')}</FormLabel>
          <Select
            options={months}
            value={values.from}
            onChange={(value) => form.change('from', value as MonthChoice)}
            placeholder={translate('Earliest')}
            isClearable
          />
        </FormField>
        <FormField className="mb-3">
          <FormLabel>{translate('To month')}</FormLabel>
          <Select
            options={months}
            value={values.to}
            onChange={(value) => form.change('to', value as MonthChoice)}
            placeholder={translate('Latest')}
            isClearable
          />
        </FormField>
      </div>
      <FormField className="mb-4">
        <FormLabel>{translate('Resource (optional)')}</FormLabel>
        <AsyncSelect
          key={offeringUuids.join(',')}
          placeholder={translate('All Arrow resources')}
          loadOptions={loadResources}
          getOptionValue={(option: Resource) => option.uuid}
          getOptionLabel={(option: Resource) => option.name}
          value={values.resource}
          onChange={(value) => form.change('resource', value as Resource)}
          isClearable
          isDisabled={!offeringUuids.length}
        />
        <FormText variant="muted">
          {translate('Leave empty to include every Arrow resource.')}
        </FormText>
      </FormField>
      <RadioGroup<Scope>
        label={translate('Records')}
        options={SCOPES()}
        value={values.scope}
        onValueChange={(value) => form.change('scope', value)}
      />
      <StepError error={props.data.error} />
    </WizardModal>
  );
};

const PreviewStep: FC<WizardStepProps> = (props) => {
  const form = useForm<CleanupValues>();
  const { values } = useFormState<CleanupValues>();
  const report = values.preview;
  if (!report) {
    return <WizardModal {...props}>{null}</WizardModal>;
  }
  return (
    <WizardModal {...props}>
      {report.records_to_delete ? (
        <>
          <AlertItem
            type="floating"
            variant="warning"
            title={translate(
              '{records} consumption record(s) would be deleted, with {items} consumption invoice item(s) and {compensations} adjustment item(s) on open invoices.',
              {
                records: report.records_to_delete,
                items: report.invoice_items_affected,
                compensations: report.compensation_items_affected,
              },
            )}
            body={translate(
              'The next consumption sync fetches those months from Arrow again and recreates them.',
            )}
          />
          <Kept report={report} />
          <Checkbox
            className="mt-4"
            label={translate(
              'I understand that these records and invoice items will be deleted',
            )}
            checked={values.confirmed}
            onCheckedChange={(checked) =>
              form.change('confirmed', checked === true)
            }
          />
        </>
      ) : (
        <>
          <AlertItem
            type="floating"
            variant="info"
            title={translate('No consumption record would be deleted.')}
          />
          <Kept report={report} />
        </>
      )}
      <StepError error={props.data.error} />
    </WizardModal>
  );
};

const DoneStep: FC<WizardStepProps> = (props) => {
  const { values } = useFormState<CleanupValues>();
  const report = values.result;
  return (
    <WizardModal {...props}>
      {report && (
        <>
          <AlertItem
            type="floating"
            variant="success"
            title={translate(
              '{records} consumption record(s) deleted, with {items} consumption invoice item(s) and {compensations} adjustment item(s).',
              {
                records: report.records_deleted,
                items: report.invoice_items_affected,
                compensations: report.compensation_items_affected,
              },
            )}
          />
          <Kept report={report} />
        </>
      )}
    </WizardModal>
  );
};

const STEPS = (): ProgressStep[] => [
  { key: 'choose', label: translate('Choose'), completed: false },
  { key: 'review', label: translate('Review'), completed: false },
  { key: 'delete', label: translate('Delete'), completed: false },
];

const WIZARD_FORMS = [ChooseStep, PreviewStep, DoneStep];

export const CleanupConsumptionWizard = () => {
  const queryClient = useQueryClient();
  const months = useMemo(() => makeMonths(), []);
  const steps = useMemo(() => STEPS(), []);
  const initialValues = useMemo<CleanupValues>(
    () => ({
      from: null,
      to: null,
      resource: null,
      scope: 'all',
      confirmed: false,
      preview: null,
      result: null,
    }),
    [],
  );

  const previewMutation = useMutation({
    mutationFn: (values: CleanupValues) => cleanup(values, true),
  });
  const deleteMutation = useMutation({
    mutationFn: (values: CleanupValues) => cleanup(values, false),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: arrowQueryKeys.all }),
  });
  const error = previewMutation.error || deleteMutation.error;

  const renderFooter = (props: WizardFooterRenderProps<CleanupValues>) => {
    if (props.step === 0) {
      return (
        <>
          <CloseDialogButton />
          <BaseButton
            variant="primary"
            size="lg"
            label={translate('Preview cleanup')}
            iconNode={<CaretRightIcon weight="bold" />}
            pending={previewMutation.isPending}
            onClick={() =>
              previewMutation.mutate(props.values, {
                onSuccess: (data) => {
                  props.form.change('preview', data);
                  props.form.change('confirmed', false);
                  props.handleSubmit();
                },
              })
            }
          />
        </>
      );
    }
    if (props.step === 1) {
      const nothing = !props.values.preview?.records_to_delete;
      return (
        <>
          <BaseButton
            variant="tertiary"
            size="lg"
            className="min-w-dialog-action me-auto"
            label={translate('Back')}
            iconNode={<CaretLeftIcon weight="bold" />}
            onClick={props.onPrev}
            disabled={deleteMutation.isPending}
            disabledReason={translate('The records are being deleted')}
          />
          <CloseDialogButton />
          <BaseButton
            variant="danger"
            size="lg"
            label={translate('Delete records')}
            iconNode={<TrashIcon weight="bold" />}
            pending={deleteMutation.isPending}
            disabled={nothing || !props.values.confirmed}
            disabledReason={
              nothing
                ? translate('No record would be deleted')
                : translate('Confirm the deletion first')
            }
            onClick={() =>
              deleteMutation.mutate(props.values, {
                onSuccess: (data) => {
                  props.form.change('result', data);
                  props.handleSubmit();
                },
              })
            }
          />
        </>
      );
    }
    return <CloseDialogButton variant="primary" label={translate('Close')} />;
  };

  return (
    <Wizard<CleanupValues>
      title={translate('Clean up consumption data')}
      subtitle={translate(
        'Delete Arrow consumption records so the next sync fetches them again. Months on an issued invoice or settled by an import are always kept.',
      )}
      steps={steps}
      wizardForms={WIZARD_FORMS}
      initialValues={initialValues}
      data={{ months, error }}
      onSubmit={() => undefined}
      renderFooter={renderFooter}
    />
  );
};
