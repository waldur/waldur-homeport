import { FC, useMemo } from 'react';
import { Col, Row, Table as BsTable } from 'react-bootstrap';
import { useFormState } from 'react-final-form';

import { required } from '@/core/validators';
import { SelectGroup } from '@/form';
import { translate } from '@/i18n';
import { WizardForm, WizardFormStepProps } from '@/wizard';

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

  const { values } = useFormState({ subscription: { values: true } });
  const customerColumn = values?.customerColumn?.value;
  const itemNameColumn = values?.itemNameColumn?.value;
  const amountColumn = values?.amountColumn?.value;
  const articleCodeColumn = values?.articleCodeColumn?.value;
  const serviceProviderColumn = values?.serviceProviderColumn?.value;
  const offeringColumn = values?.offeringColumn?.value;
  const planColumn = values?.planColumn?.value;

  return (
    <WizardForm {...props}>
      <div className="text-muted">
        <h6 className="fw-bold mb-5">{translate('Map columns to fields')}</h6>
        <p className="mb-4">
          {translate(
            'Select which columns from your file correspond to each field.',
          )}
        </p>

        <Row className="mb-4">
          <Col md={6} className="mb-3">
            <SelectGroup
              name="customerColumn"
              label={translate('Customer name')}
              validate={required}
              required
              options={columnOptions}
              placeholder={translate('Select column')}
              isClearable={false}
            />
          </Col>
          <Col md={6} className="mb-3">
            <SelectGroup
              name="itemNameColumn"
              label={translate('Item name')}
              validate={required}
              required
              options={columnOptions}
              placeholder={translate('Select column')}
              isClearable={false}
            />
          </Col>
          <Col md={6} className="mb-3">
            <SelectGroup
              name="amountColumn"
              label={translate('Amount')}
              validate={required}
              required
              options={columnOptions}
              placeholder={translate('Select column')}
              isClearable={false}
            />
          </Col>
          <Col md={6} className="mb-3">
            <SelectGroup
              name="articleCodeColumn"
              label={translate('Article code')}
              options={columnOptions}
              placeholder={translate('Select column')}
              isClearable
            />
          </Col>
          <Col md={6} className="mb-3">
            <SelectGroup
              name="serviceProviderColumn"
              label={translate('Service provider')}
              options={columnOptions}
              placeholder={translate('Select column')}
              isClearable
            />
          </Col>
          <Col md={6} className="mb-3">
            <SelectGroup
              name="offeringColumn"
              label={translate('Offering')}
              options={columnOptions}
              placeholder={translate('Select column')}
              isClearable
            />
          </Col>
          <Col md={6} className="mb-3">
            <SelectGroup
              name="planColumn"
              label={translate('Plan')}
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
                    {articleCodeColumn && <th>{translate('Article code')}</th>}
                    {serviceProviderColumn && <th>{translate('Provider')}</th>}
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
                        {amountColumn ? String(row[amountColumn] || '') : '-'}
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
                      {planColumn && <td>{String(row[planColumn] || '')}</td>}
                    </tr>
                  ))}
                </tbody>
              </BsTable>
            </div>
          </>
        )}
      </div>
    </WizardForm>
  );
};
