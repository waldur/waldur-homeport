import { FC, useMemo } from 'react';
import { Col, Form, Row, Table as BsTable } from 'react-bootstrap';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { SelectField } from '@waldur/form';
import { WizardForm, WizardFormStepProps } from '@waldur/form/WizardForm';
import { translate } from '@waldur/i18n';

import { ExcelParseResult } from './types';

interface Step2Props extends WizardFormStepProps {
  data: {
    parseResult: ExcelParseResult | null;
  };
}

export const Step2ColumnMapping: FC<Step2Props> = (props) => {
  const { parseResult } = props.data || {};
  const headers = parseResult?.headers || [];
  const rows = parseResult?.rows || [];

  const columnOptions = useMemo(() => {
    return headers.map((header) => ({
      label: header,
      value: header,
    }));
  }, [headers]);

  // Get preview rows (first 3)
  const previewRows = useMemo(() => rows.slice(0, 3), [rows]);

  return (
    <WizardForm {...props}>
      {(wizardProps) => {
        const { formValues } = wizardProps;
        const customerColumn = formValues?.customerColumn?.value;
        const itemNameColumn = formValues?.itemNameColumn?.value;
        const amountColumn = formValues?.amountColumn?.value;
        const articleCodeColumn = formValues?.articleCodeColumn?.value;
        const serviceProviderColumn = formValues?.serviceProviderColumn?.value;
        const offeringColumn = formValues?.offeringColumn?.value;
        const planColumn = formValues?.planColumn?.value;

        return (
          <div className="text-muted">
            <h6 className="fw-bold mb-5">
              {translate('Map columns to fields')}
            </h6>
            <p className="mb-4">
              {translate(
                'Select which columns from your file correspond to each field.',
              )}
            </p>

            <Row className="mb-4">
              <Col md={6} className="mb-3">
                <Form.Label>
                  {translate('Customer name')}{' '}
                  <span className="text-danger">*</span>
                </Form.Label>
                <Field
                  name="customerColumn"
                  component={SelectField}
                  options={columnOptions}
                  validate={required}
                  placeholder={translate('Select column')}
                  isClearable={false}
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>
                  {translate('Item name')}{' '}
                  <span className="text-danger">*</span>
                </Form.Label>
                <Field
                  name="itemNameColumn"
                  component={SelectField}
                  options={columnOptions}
                  validate={required}
                  placeholder={translate('Select column')}
                  isClearable={false}
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>
                  {translate('Amount')} <span className="text-danger">*</span>
                </Form.Label>
                <Field
                  name="amountColumn"
                  component={SelectField}
                  options={columnOptions}
                  validate={required}
                  placeholder={translate('Select column')}
                  isClearable={false}
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>
                  {translate('Article code')} ({translate('optional')})
                </Form.Label>
                <Field
                  name="articleCodeColumn"
                  component={SelectField}
                  options={columnOptions}
                  placeholder={translate('Select column')}
                  isClearable
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>
                  {translate('Service provider')} ({translate('optional')})
                </Form.Label>
                <Field
                  name="serviceProviderColumn"
                  component={SelectField}
                  options={columnOptions}
                  placeholder={translate('Select column')}
                  isClearable
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>
                  {translate('Offering')} ({translate('optional')})
                </Form.Label>
                <Field
                  name="offeringColumn"
                  component={SelectField}
                  options={columnOptions}
                  placeholder={translate('Select column')}
                  isClearable
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>
                  {translate('Plan')} ({translate('optional')})
                </Form.Label>
                <Field
                  name="planColumn"
                  component={SelectField}
                  options={columnOptions}
                  placeholder={translate('Select column')}
                  isClearable
                />
              </Col>
            </Row>

            {previewRows.length > 0 && (
              <>
                <hr />
                <h6 className="fw-bold mb-3">{translate('Preview')}</h6>
                <p className="text-muted mb-3">
                  {translate('Showing first {count} rows with mapped values', {
                    count: previewRows.length,
                  })}
                </p>
                <div className="table-responsive">
                  <BsTable bordered hover size="sm">
                    <thead className="bg-light">
                      <tr>
                        <th>{translate('Customer')}</th>
                        <th>{translate('Item name')}</th>
                        <th>{translate('Amount')}</th>
                        {articleCodeColumn && (
                          <th>{translate('Article code')}</th>
                        )}
                        {serviceProviderColumn && (
                          <th>{translate('Provider')}</th>
                        )}
                        {offeringColumn && <th>{translate('Offering')}</th>}
                        {planColumn && <th>{translate('Plan')}</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map((row, index) => (
                        <tr key={index}>
                          <td>
                            {customerColumn
                              ? String(row[customerColumn] || '')
                              : '-'}
                          </td>
                          <td>
                            {itemNameColumn
                              ? String(row[itemNameColumn] || '')
                              : '-'}
                          </td>
                          <td>
                            {amountColumn
                              ? String(row[amountColumn] || '')
                              : '-'}
                          </td>
                          {articleCodeColumn && (
                            <td>{String(row[articleCodeColumn] || '')}</td>
                          )}
                          {serviceProviderColumn && (
                            <td>{String(row[serviceProviderColumn] || '')}</td>
                          )}
                          {offeringColumn && (
                            <td>{String(row[offeringColumn] || '')}</td>
                          )}
                          {planColumn && (
                            <td>{String(row[planColumn] || '')}</td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </BsTable>
                </div>
              </>
            )}
          </div>
        );
      }}
    </WizardForm>
  );
};
