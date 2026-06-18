import { Card, Col, Row } from 'react-bootstrap';
import { FieldArrayRenderProps } from 'react-final-form-arrays';

import { required } from '@/core/validators';
import { StringGroup } from '@/form';
import { translate } from '@/i18n';
import { CompactActionButton } from '@/table/CompactActionButton';

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
              <StringGroup
                name={`${member}.key`}
                label={translate('Key')}
                description={translate(
                  'Internal identifier (lowercase, no spaces)',
                )}
                placeholder={translate('Key')}
                validate={required}
              />
            </Col>
            <Col md={6}>
              <StringGroup
                name={`${member}.label`}
                label={translate('Display Label')}
                description={translate('User-friendly name shown in dropdown')}
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
