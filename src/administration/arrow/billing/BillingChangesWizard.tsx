import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { FC, useMemo } from 'react';
import { useForm, useFormState } from 'react-final-form';
import {
  adminArrowBillingSyncsBillingChanges,
  adminArrowBillingSyncsBillingChangesJobRetrieve,
  type BillingChangesResponse,
  type BillingInvoiceChange,
  type BillingItemChange,
  type Resource,
} from 'waldur-js-client';

import {
  AlertItem,
  Badge,
  BaseButton,
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

import { formatDateTime, formatMonth } from '@/core/dateUtils';
import { format } from '@/core/ErrorMessageFormatter';
import { defaultCurrency } from '@/core/formatCurrency';
import { AsyncSelect, Select } from '@/form/select';
import { translate } from '@/i18n';
import { resourceAutocomplete } from '@/marketplace/common/autocompletes';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { SimpleTable } from '@/table/SimpleTable';
import { renderFieldOrDash } from '@/table/utils';

import {
  arrowQueryKeys,
  useActiveVendorOfferingMappings,
  useArrowSettings,
} from '../api';

export type BillingAction =
  'sync_billing' | 'sync_consumption' | 'settle_month';

interface MonthChoice {
  label: string;
  value: { year: number; month: number; ended: boolean };
}

const makeMonths = (): MonthChoice[] => {
  let date = DateTime.now().startOf('month');
  return Array.from({ length: 24 }, (_, i) => {
    const choice = {
      label: formatMonth(date.toJSDate()),
      value: { year: date.year, month: date.month, ended: i > 0 },
    };
    date = date.minus({ months: 1 });
    return choice;
  });
};

const ACTIONS = () => [
  {
    value: 'sync_billing' as BillingAction,
    label: translate('Sync billing lines'),
    description: translate(
      "Fetch Arrow's billing lines for the month and put them on the invoices. Licenses billed through consumption are skipped.",
    ),
  },
  {
    value: 'sync_consumption' as BillingAction,
    label: translate('Sync consumption'),
    description: translate(
      "Fetch each license's consumption for the month from Arrow and update its consumption item while the invoice is open.",
    ),
  },
  {
    value: 'settle_month' as BillingAction,
    label: translate('Settle a past month'),
    description: translate(
      "Compare Arrow's final billing for an ended month with what was invoiced, and add the difference to the current invoice as adjustments. Nothing new is fetched.",
    ),
  },
];

const CHANGE_LABELS = () => ({
  created: translate('New'),
  updated: translate('Changed'),
  deleted: translate('Removed'),
});

const CHANGE_VARIANTS = {
  created: 'success',
  updated: 'warning',
  deleted: 'danger',
} as const;

const summarize = (report: BillingChangesResponse) => {
  const items = report.invoices.flatMap((invoice) => invoice.items);
  const count = (change: string) =>
    items.filter((item) => item.change === change).length;
  const delta = report.invoices.reduce(
    (sum, invoice) =>
      sum + Number(invoice.total_after) - Number(invoice.total_before),
    0,
  );
  return {
    invoices: report.invoices.length,
    created: count('created'),
    updated: count('updated'),
    deleted: count('deleted'),
    delta,
  };
};

const InvoiceChanges = ({ invoice }: { invoice: BillingInvoiceChange }) => {
  const labels = CHANGE_LABELS();
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="font-medium">{invoice.customer_name}</span>
        <span className="text-quaternary">
          {formatMonth(new Date(invoice.year, invoice.month - 1, 1))}
        </span>
        <Badge variant="neutral" shape="pill" tone="outline">
          {invoice.state}
        </Badge>
        <span className="ms-auto">
          {defaultCurrency(invoice.total_before)} →{' '}
          <span className="font-medium">
            {defaultCurrency(invoice.total_after)}
          </span>
        </span>
      </div>
      <SimpleTable<BillingItemChange>
        rows={invoice.items}
        rowKey="uuid"
        columns={[
          {
            title: translate('Change'),
            render: ({ row }) => (
              <Badge
                variant={CHANGE_VARIANTS[row.change]}
                shape="pill"
                tone="outline"
              >
                {labels[row.change]}
              </Badge>
            ),
          },
          { title: translate('Item'), render: ({ row }) => <>{row.name}</> },
          {
            title: translate('Resource'),
            render: ({ row }) => <>{renderFieldOrDash(row.resource_name)}</>,
          },
          {
            title: translate('Before'),
            render: ({ row }) => <>{defaultCurrency(row.amount_before)}</>,
          },
          {
            title: translate('After'),
            render: ({ row }) => <>{defaultCurrency(row.amount_after)}</>,
          },
        ]}
      />
    </div>
  );
};

const Report = ({
  report,
  applied,
}: {
  report: BillingChangesResponse;
  applied: boolean;
}) => {
  const summary = summarize(report);
  const problems = report.problems?.length ? (
    <AlertItem
      type="floating"
      variant="warning"
      className="mb-3"
      title={
        applied
          ? translate('The run reported problems; some changes may be missing.')
          : translate(
              'The run reported problems; the preview may be incomplete.',
            )
      }
      body={
        <ul className="list-disc ps-5">
          {report.problems.map((problem, index) => (
            <li key={index}>{problem}</li>
          ))}
        </ul>
      }
    />
  ) : null;
  const summaryValues = {
    ...summary,
    delta: `${summary.delta >= 0 ? '+' : ''}${defaultCurrency(summary.delta)}`,
  };
  if (!summary.invoices) {
    return (
      <>
        {problems}
        <AlertItem
          type="floating"
          variant="info"
          title={
            applied
              ? translate('Nothing changed on any invoice.')
              : translate('Nothing would change on any invoice.')
          }
        />
      </>
    );
  }
  return (
    <>
      {problems}
      <AlertItem
        type="floating"
        variant={applied ? 'success' : 'info'}
        className="mb-3"
        title={
          applied
            ? translate(
                '{invoices} invoice(s) changed: {created} new, {updated} changed, {deleted} removed item(s); total {delta}.',
                summaryValues,
              )
            : translate(
                '{invoices} invoice(s) would change: {created} new, {updated} changed, {deleted} removed item(s); total {delta}.',
                summaryValues,
              )
        }
        body={
          applied
            ? undefined
            : translate(
                'Preview taken {time}. Invoices already issued are never changed; differences for them appear on the current invoice.',
                { time: formatDateTime(report.taken_at) },
              )
        }
      />
      {report.invoices.map((invoice) => (
        <InvoiceChanges key={invoice.invoice_uuid} invoice={invoice} />
      ))}
    </>
  );
};

interface BillingChangesValues {
  action: BillingAction;
  month: MonthChoice;
  resource: Resource | null;
  preview: BillingChangesResponse | null;
  result: BillingChangesResponse | null;
}

interface BillingChangesWizardProps {
  resolve: { action?: BillingAction; refetch?: () => void };
}

const selectedMonth = (values: BillingChangesValues, months: MonthChoice[]) =>
  values.action === 'settle_month' && !values.month.value.ended
    ? months.find((m) => m.value.ended)
    : values.month;

const requestChanges = (
  values: BillingChangesValues,
  months: MonthChoice[],
  dryRun: boolean,
) => {
  const month = selectedMonth(values, months);
  return adminArrowBillingSyncsBillingChanges({
    body: {
      action: values.action,
      year: month.value.year,
      month: month.value.month,
      resource_uuid:
        values.action !== 'settle_month' && values.resource
          ? values.resource.uuid
          : null,
      dry_run: dryRun,
    },
  }).then((response) => waitForJob(response.data.job_id));
};

const POLL_INTERVAL_MS = 2000;

/** The run calls Arrow and can take minutes, so it is a job we poll. */
const waitForJob = async (jobId: string): Promise<BillingChangesResponse> => {
  for (;;) {
    const { data: job } = await adminArrowBillingSyncsBillingChangesJobRetrieve(
      { query: { job_id: jobId } },
    );
    if (job.state === 'done') {
      return job.report;
    }
    if (job.state === 'failed') {
      throw new Error(job.error || translate('The billing action failed'));
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
};

const StepError = ({ error }: { error: unknown }) =>
  error ? (
    <AlertItem
      type="floating"
      variant="error"
      className="mt-3"
      title={format(error) || translate('The request failed')}
    />
  ) : null;

const ChooseStep: FC<WizardStepProps> = (props) => {
  const form = useForm<BillingChangesValues>();
  const { values } = useFormState<BillingChangesValues>();
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
        field: ['name', 'uuid', 'backend_id', 'attributes'],
        // One comma-separated value: the backend keeps only the last of
        // repeated params.
        offering_uuid: [offeringUuids.join(',')],
      }),
    [offeringUuids],
  );
  const monthChoices =
    values.action === 'settle_month'
      ? months.filter((m) => m.value.ended)
      : months;

  return (
    <WizardModal {...props}>
      <RadioGroup<BillingAction>
        label={translate('Action')}
        options={ACTIONS()}
        value={values.action}
        onValueChange={(value) => form.change('action', value)}
        className="mb-4"
      />
      <FormField className="mb-3">
        <FormLabel>{translate('Month')}</FormLabel>
        <Select
          options={monthChoices}
          value={selectedMonth(values, months)}
          onChange={(value) => form.change('month', value as MonthChoice)}
          isClearable={false}
        />
        {values.action === 'settle_month' && (
          <FormText variant="muted">
            {translate('Only a month that has ended can be settled.')}
          </FormText>
        )}
      </FormField>
      {values.action !== 'settle_month' && (
        <FormField>
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
      )}
      <StepError error={props.data.error} />
    </WizardModal>
  );
};

const PreviewStep: FC<WizardStepProps> = (props) => {
  const { values } = useFormState<BillingChangesValues>();
  return (
    <WizardModal {...props}>
      {values.preview && <Report report={values.preview} applied={false} />}
      <StepError error={props.data.error} />
    </WizardModal>
  );
};

const AppliedStep: FC<WizardStepProps> = (props) => {
  const { values } = useFormState<BillingChangesValues>();
  return (
    <WizardModal {...props}>
      {values.result && <Report report={values.result} applied />}
    </WizardModal>
  );
};

const STEPS = (): ProgressStep[] => [
  { key: 'what', label: translate('Choose'), completed: false },
  { key: 'preview', label: translate('Review'), completed: false },
  { key: 'apply', label: translate('Apply'), completed: false },
];

const WIZARD_FORMS = [ChooseStep, PreviewStep, AppliedStep];

export const BillingChangesWizard = ({
  resolve,
}: BillingChangesWizardProps) => {
  const queryClient = useQueryClient();
  const months = useMemo(() => makeMonths(), []);
  const steps = useMemo(() => STEPS(), []);
  const initialValues = useMemo<BillingChangesValues>(
    () => ({
      action: resolve.action ?? 'sync_billing',
      month: months[0],
      resource: null,
      preview: null,
      result: null,
    }),
    [],
  );

  const previewMutation = useMutation({
    mutationFn: (values: BillingChangesValues) =>
      requestChanges(values, months, true),
  });
  const applyMutation = useMutation({
    mutationFn: (values: BillingChangesValues) =>
      requestChanges(values, months, false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: arrowQueryKeys.all });
      resolve.refetch?.();
    },
  });
  const error = previewMutation.error || applyMutation.error;

  const renderFooter = (
    props: WizardFooterRenderProps<BillingChangesValues>,
  ) => {
    if (props.step === 0) {
      return (
        <>
          <CloseDialogButton />
          <BaseButton
            variant="primary"
            size="lg"
            label={translate('Preview changes')}
            iconNode={<CaretRightIcon weight="bold" />}
            pending={previewMutation.isPending}
            onClick={() =>
              previewMutation.mutate(props.values, {
                onSuccess: (data) => {
                  props.form.change('preview', data);
                  props.handleSubmit();
                },
              })
            }
          />
        </>
      );
    }
    if (props.step === 1) {
      const nothingToApply = props.values.preview
        ? !summarize(props.values.preview).invoices
        : true;
      return (
        <>
          <BaseButton
            variant="tertiary"
            size="lg"
            className="min-w-dialog-action me-auto"
            label={translate('Back')}
            iconNode={<CaretLeftIcon weight="bold" />}
            onClick={props.onPrev}
            disabled={applyMutation.isPending}
            disabledReason={translate('The changes are being applied')}
          />
          <CloseDialogButton />
          <BaseButton
            variant="primary"
            size="lg"
            label={translate('Apply changes')}
            pending={applyMutation.isPending}
            disabled={nothingToApply}
            disabledReason={translate('Nothing would change')}
            onClick={() =>
              applyMutation.mutate(props.values, {
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
    <Wizard<BillingChangesValues>
      title={translate('Billing changes')}
      subtitle={translate(
        'Choose an Arrow billing action, preview what it changes on invoices, then apply it.',
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
