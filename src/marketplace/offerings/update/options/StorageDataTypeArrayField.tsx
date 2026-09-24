import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { Card, Col, Row } from 'react-bootstrap';
import { FieldArrayRenderProps } from 'react-final-form-arrays';

import { required } from '@/core/validators';
import { StringGroup } from '@/form';
import { FieldError } from '@/form/FieldError';
import { translate } from '@/i18n';
import { CompactActionButton } from '@/table/CompactActionButton';

// Same bordered grey card per row as the cascade steps list two fields away.
// Its buttons are the compact (sm) ones rather than that list's large ones.
export const StorageDataTypeArrayField = ({
  fields,
  meta: { touched, error },
}: FieldArrayRenderProps<any, HTMLElement>) => (
  <div>
    {fields.map((member, index) => (
      <Card key={index} className="card-bordered bg-gray-50 mb-3">
        <Card.Header className="mx-4 min-h-auto">
          <h6 className="mb-0 text-gray">
            {translate('Storage Data Type {index}', { index: index + 1 })}
          </h6>
          <div className="card-toolbar m-0">
            <CompactActionButton
              action={() => fields.remove(index)}
              tooltip={translate('Remove')}
              iconNode={<TrashIcon weight="bold" />}
              variant="text-danger"
            />
          </div>
        </Card.Header>
        <Card.Body className="px-4">
          <Row>
            <Col md={6}>
              <StringGroup
                name={`${member}.key`}
                label={translate('Key')}
                required
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
                required
                description={translate('User-friendly name shown in dropdown')}
                placeholder={translate('Display Label')}
                validate={required}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>
    ))}
    <div>
      <CompactActionButton
        variant="text-primary"
        action={() => fields.push({ key: '', label: '' })}
        iconNode={<PlusIcon weight="bold" />}
        title={translate('Add Storage Data Type')}
      />
    </div>
    {touched && error && <FieldError error={error} />}
  </div>
);
