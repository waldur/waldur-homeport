import { DateTime } from 'luxon';
import { Col, Form, Modal, Row } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useAsync } from 'react-use';
import { Field, FieldArray, reduxForm } from 'redux-form';

import { getList } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { AccountingPeriodField } from '@waldur/customer/list/AccountingPeriodField';
import { getOptions } from '@waldur/customer/list/AccountingRunningField';
import { sendFinancialReport } from '@waldur/customer/list/api';
import { EXPORT_AS_EMAIL_FORM_ID } from '@waldur/customer/list/constants';
import { makeAccountingPeriods } from '@waldur/customer/list/utils';
import { SubmitButton } from '@waldur/form';
import { EmailField } from '@waldur/form/EmailField';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';

interface Invoice {
  year: number;
  month: number;
}

const getInvoices = (params) => getList<Invoice>('/invoices/', params);

async function oldestInvoice() {
  const params = {
    page_size: 1,
    o: ['year', 'month'].join(','),
    field: ['year', 'month'],
  };
  const response = await getInvoices(params);
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

  const submit = (formData: any) => {
    const payload = {
      emails: formData.emails || [],
      month: formData.accounting_period
        ? formData.accounting_period.value.month || null
        : null,
      year: formData.accounting_period
        ? formData.accounting_period.value.year || null
        : null,
    };

    sendFinancialReport(payload)
      .then(() => {
        dispatch(showSuccess(translate('Report has been sent')));
        dispatch(closeModalDialog());
      })
      .catch((error) => {
        dispatch(showErrorResponse(error, translate('Something went wrong')));
      });
  };

  return (
    <form onSubmit={handleSubmit(submit)}>
      <Modal.Body className="p-12">
        <Row>
          <Col md={12} lg={8} className="d-flex flex-column">
            <div>
              <Form.Label>{translate('Emails')}</Form.Label>
              <FieldArray name="emails" component={renderEmails} />
            </div>

            <div className="mt-4">
              <AccountingPeriodField options={data.accountingPeriods} />
            </div>

            <div className="mt-4">
              <SubmitButton
                submitting={submitting}
                label={translate('Send report')}
              />
            </div>
          </Col>
        </Row>
      </Modal.Body>
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
            <i className="fa fa-trash-o"></i>
          </button>
        </Col>
      </Row>
    ))}
    <Row>
      <Col>
        <ActionButton
          title={translate('Add email')}
          action={() => fields.push()}
          icon="fa fa-plus"
          variant="primary"
        />
      </Col>
    </Row>
  </>
);
