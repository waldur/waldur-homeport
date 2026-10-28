import { PlusCircleIcon, TrashIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import arrayMutators from 'final-form-arrays';
import { DateTime } from 'luxon';
import { FC } from 'react';
import { Field, Form as FinalForm } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import {
  invoiceSendFinancialReportByMail,
  invoicesList,
} from 'waldur-js-client';

import { BaseButton, FormFieldset, FormLegend } from 'waldur-ui';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { composeValidators, email, required } from '@/core/validators';
import { AccountingPeriodFieldComponent } from '@/customer/list/AccountingPeriodField';
import { getOptions } from '@/customer/list/AccountingRunningField';
import { makeAccountingPeriods } from '@/customer/list/utils';
import { SubmitButton } from '@/form';
import { EmailField } from '@/form/EmailField';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

async function oldestInvoice() {
  const response = (
    await invoicesList({
      query: {
        page_size: 1,
        o: ['year', 'month'],
        field: ['year', 'month'],
      },
    })
  ).data;
  if (response.length === 1) {
    const invoice = response[0];
    return DateTime.fromObject({
      year: invoice.year,
      month: invoice.month,
    });
  } else {
    return DateTime.now().startOf('month');
  }
}

async function loadData() {
  const start = await oldestInvoice();
  const accountingPeriods = makeAccountingPeriods(start);
  const initialValues = {
    accounting_period: accountingPeriods[0],
    accounting_is_running: getOptions()[0],
  };
  return { initialValues, accountingPeriods };
}

export const ExportAsEmailDialog: FC = () => {
  const {
    isLoading: loading,
    error,
    data,
  } = useQuery({
    queryKey: ['ExportAsEmailDialog'],
    queryFn: loadData,
  });
  const submitMutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) =>
      invoiceSendFinancialReportByMail({
        body: {
          emails: formData.emails || [],
          month: formData.accounting_period
            ? formData.accounting_period.value.month || null
            : null,
          year: formData.accounting_period
            ? formData.accounting_period.value.year || null
            : null,
        },
      }),
    successMessage: translate('Report has been sent'),
    errorMessage: translate('Something went wrong'),
  });

  if (loading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <>{translate('Unable to load financial overview.')}</>;
  }

  return (
    <FinalForm
      onSubmit={(values) => submitMutation.mutateAsync(values)}
      initialValues={data.initialValues}
      mutators={{ ...arrayMutators }}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Send report')}
            footer={
              <SubmitButton
                submitting={submitting}
                invalid={invalid}
                label={translate('Send report')}
              />
            }
          >
            <div className="grid grid-cols-1 gap-x-5 lg:grid-cols-12">
              <div className="flex flex-col lg:col-span-8">
                <FormFieldset>
                  <FormLegend>{translate('Emails')}</FormLegend>
                  <FieldArray name="emails" component={renderEmails} />
                </FormFieldset>

                <div className="mt-3">
                  <Field
                    name="accounting_period"
                    component={AccountingPeriodFieldComponent}
                    options={data.accountingPeriods}
                  />
                </div>

                <div className="mt-3" />
              </div>
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};

const renderEmails = ({ fields }: any) => (
  <>
    {fields.map((emailName: any, index: number) => (
      <div
        key={emailName}
        className="grid grid-cols-1 gap-x-5 mb-2.5 md:grid-cols-12"
      >
        <div className="md:col-span-10">
          <Field
            name={emailName}
            type="email"
            validate={composeValidators(required, email)}
          >
            {({ input, meta }) => (
              <EmailField
                input={input}
                meta={meta}
                aria-label={`${translate('Email')} ${index + 1}`}
                required={true}
              />
            )}
          </Field>
        </div>
        <div className="md:col-span-2">
          <BaseButton
            tooltip={translate('Remove')}
            variant="danger"
            onClick={() => fields.remove(index)}
            iconNode={<TrashIcon weight="bold" />}
          />
        </div>
      </div>
    ))}
    <div>
      <BaseButton
        label={translate('Add email')}
        onClick={() => fields.push(undefined)}
        iconNode={<PlusCircleIcon weight="bold" />}
        variant="primary"
        size="lg"
      />
    </div>
  </>
);
