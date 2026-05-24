import { PlusCircleIcon, TrashIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import arrayMutators from 'final-form-arrays';
import { DateTime } from 'luxon';
import { FC } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { Field, Form as FinalForm } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import {
  invoiceSendFinancialReportByMail,
  invoicesList,
} from 'waldur-js-client';

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
import { ActionButton } from '@/table/ActionButton';

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
            <Row>
              <Col md={12} lg={8} className="d-flex flex-column">
                <div>
                  <Form.Label>{translate('Emails')}</Form.Label>
                  <FieldArray name="emails" component={renderEmails} />
                </div>

                <div className="mt-4">
                  <Field
                    name="accounting_period"
                    component={AccountingPeriodFieldComponent}
                    options={data.accountingPeriods}
                  />
                </div>

                <div className="mt-4" />
              </Col>
            </Row>
          </ModalDialog>
        </form>
      )}
    />
  );
};

const renderEmails = ({ fields }: any) => (
  <>
    {fields.map((emailName: any, index: number) => (
      <Row key={emailName} className="mb-3">
        <Col md={10}>
          <Field
            name={emailName}
            type="email"
            component={EmailField}
            label={translate('Email')}
            validate={composeValidators(required, email)}
            required={true}
          />
        </Col>
        <Col sm={2}>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => fields.remove(index)}
          >
            <span className="svg-icon svg-icon-2">
              <TrashIcon weight="bold" />
            </span>
          </button>
        </Col>
      </Row>
    ))}
    <Row>
      <Col>
        <ActionButton
          title={translate('Add email')}
          action={() => fields.push(undefined)}
          iconNode={<PlusCircleIcon weight="bold" />}
          variant="primary"
        />
      </Col>
    </Row>
  </>
);
