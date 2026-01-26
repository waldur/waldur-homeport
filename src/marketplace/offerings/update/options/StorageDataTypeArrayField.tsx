import { Card, Col, Row } from 'react-bootstrap';
import { Field } from 'react-final-form';
import { FieldArrayRenderProps } from 'react-final-form-arrays';

import { required } from '@waldur/core/validators';
import { InputField } from '@waldur/form/InputField';
import { translate } from '@waldur/i18n';
import { CompactActionButton } from '@waldur/table/CompactActionButton';

export const StorageDataTypeArrayField = ({
  fields,
  meta: { touched, error },
}: FieldArrayRenderProps<any, HTMLElement>) => (
  <div>
    {fields.map((member, index) => (
      <Card key={index} className="mb-3">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <span className="fw-bold">
            {translate('Storage Data Type')} #{index + 1}
          </span>
          <CompactActionButton
            title={translate('Remove')}
            variant="danger"
            action={() => fields.remove(index)}
          />
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <Field
                name={`${member}.key`}
                component={InputField as any}
                label={translate('Key')}
                help_text={translate(
                  'Internal identifier (lowercase, no spaces)',
                )}
                placeholder={translate('Key')}
                validate={required}
              />
            </Col>
            <Col md={6}>
              <Field
                name={`${member}.label`}
                component={InputField as any}
                label={translate('Display Label')}
                help_text={translate('User-friendly name shown in dropdown')}
                placeholder={translate('Display Label')}
                validate={required}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>
    ))}
    <CompactActionButton
      title={translate('Add Storage Data Type')}
      variant="outline-primary"
      action={() => fields.push({ key: '', label: '' })}
    />
    {touched && error && (
      <div className="invalid-feedback d-block">{error}</div>
    )}
  </div>
);
