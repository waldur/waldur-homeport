import { PlusCircleIcon, TrashIcon } from '@phosphor-icons/react';
import { DateTime } from 'luxon';
import { Col, Form, Row } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useAsync } from 'react-use';
import { Field, FieldArray, reduxForm } from 'redux-form';
import {
  invoiceSendFinancialReportByMail,
  invoicesList,
} from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { AccountingPeriodField } from '@/customer/list/AccountingPeriodField';
import { getOptions } from '@/customer/list/AccountingRunningField';
import { EXPORT_AS_EMAIL_FORM_ID } from '@/customer/list/constants';
import { makeAccountingPeriods } from '@/customer/list/utils';
import { SubmitButton } from '@/form';
import { EmailField } from '@/form/EmailField';
import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@/store/notify';
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

export const ExportAsEmailDialog = reduxForm<{}, any>({
  form: EXPORT_AS_EMAIL_FORM_ID,
  enableReinitialize: true,
})(({ submitting, handleSubmit }) => {
  const { loading, error, value: data } = useAsync(loadData);
  const dispatch = useDispatch();
  if (loading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <>{translate('Unable to load financial overview.')}</>;
  }

  const submit = async (formData: any) => {
    try {
      await invoiceSendFinancialReportByMail({
        body: {
          emails: formData.emails || [],
          month: formData.accounting_period
            ? formData.accounting_period.value.month || null
            : null,
          year: formData.accounting_period
            ? formData.accounting_period.value.year || null
            : null,
        },
      });
      dispatch(showSuccess(translate('Report has been sent')));
      dispatch(closeModalDialog());
    } catch (error) {
      dispatch(showErrorResponse(error, translate('Something went wrong')));
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)}>
      <ModalDialog
        title={translate('Send report')}
        footer={
          <SubmitButton
            submitting={submitting}
            label={translate('Send report')}
          />
        }
        closeButton
      >
        <Row>
          <Col md={12} lg={8} className="d-flex flex-column">
            <div>
              <Form.Label>{translate('Emails')}</Form.Label>
              <FieldArray name="emails" component={renderEmails} />
            </div>

            <div className="mt-4">
              <AccountingPeriodField options={data.accountingPeriods} />
            </div>

            <div className="mt-4" />
          </Col>
        </Row>
      </ModalDialog>
    </form>
  );
});

const renderEmails = ({ fields }: any) => (
  <>
    {fields.map((email: any, index: number) => (
      <Row key={index} className="mb-3">
        <Col md={10}>
          <Field
            name={`${email}`}
            type="email"
            component={EmailField}
            label={translate('Email')}
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
          action={() => fields.push()}
          iconNode={<PlusCircleIcon weight="bold" />}
          variant="primary"
        />
      </Col>
    </Row>
  </>
);
