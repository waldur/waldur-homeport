import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { DateField } from '@waldur/form/DateField';
import { FormGroup } from '@waldur/form/FormGroup';
import { StringField } from '@waldur/form/StringField';
import { translate } from '@waldur/i18n';

export interface PersonIdentifierFieldConfig {
  validation_method: string;
  person_identifier_fields:
    | {
        // String type (e.g., Estonian civil_number)
        type: 'string';
        field: string;
        label: string;
        description?: string;
        example?: string;
        pattern?: string;
        help_text?: string;
      }
    | {
        // Object type (e.g., Austrian personal data)
        type: 'object';
        description?: string;
        fields: {
          [key: string]: {
            type: 'string' | 'date';
            label: string;
            description?: string;
            required?: boolean;
            example?: string;
            max_length?: number;
            format?: string;
          };
        };
      };
}

interface PersonIdentifierFieldsRendererProps {
  fieldConfig: PersonIdentifierFieldConfig | null;
  loading?: boolean;
}

export const PersonIdentifierFieldsRenderer: FunctionComponent<
  PersonIdentifierFieldsRendererProps
> = ({ fieldConfig, loading }) => {
  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">{translate('Loading...')}</span>
        </div>
      </div>
    );
  }

  if (!fieldConfig || !fieldConfig.person_identifier_fields) {
    return null;
  }

  const { person_identifier_fields } = fieldConfig;

  // Handle string type (single field)
  if (person_identifier_fields.type === 'string') {
    const fieldName = `person_identifier_${person_identifier_fields.field}`;
    const validators = person_identifier_fields.pattern
      ? [
          required,
          (value) => {
            const regex = new RegExp(person_identifier_fields.pattern);
            return regex.test(value)
              ? undefined
              : translate(
                  'Invalid format. {}',
                  person_identifier_fields.help_text || '',
                );
          },
        ]
      : [required];

    return (
      <div className="mb-4">
        <h6 className="mb-3">
          {translate('Personal identification required')}
        </h6>
        {person_identifier_fields.description && (
          <p className="text-muted mb-3">
            {person_identifier_fields.description}
          </p>
        )}
        <Row className="g-4">
          <Col md={6}>
            <Field
              name={fieldName}
              label={person_identifier_fields.label}
              component={FormGroup}
              required={true}
              validate={validators}
              description={person_identifier_fields.help_text}
              placeholder={person_identifier_fields.example}
            >
              <StringField />
            </Field>
          </Col>
        </Row>
      </div>
    );
  }

  // Handle object type (multiple fields)
  if (person_identifier_fields.type === 'object') {
    const fields = person_identifier_fields.fields;
    const fieldEntries = Object.entries(fields);
    const totalFields = fieldEntries.length;

    return (
      <div className="mb-4">
        <h6 className="mb-3">
          {translate('Personal identification required')}
        </h6>
        {person_identifier_fields.description && (
          <p className="text-muted mb-3">
            {person_identifier_fields.description}
          </p>
        )}
        <Row className="g-4">
          {fieldEntries.map(([fieldKey, fieldSpec], index) => {
            const fieldName = `person_identifier_${fieldKey}`;
            const validators = fieldSpec.required ? [required] : [];
            const isLastOdd =
              totalFields % 2 !== 0 && index === totalFields - 1;

            return (
              <Col md={isLastOdd ? 12 : 6} key={fieldKey}>
                <Field
                  name={fieldName}
                  label={fieldSpec.label}
                  component={FormGroup}
                  required={fieldSpec.required}
                  validate={validators}
                  description={fieldSpec.description}
                  placeholder={fieldSpec.example}
                  maxLength={fieldSpec.max_length}
                >
                  {fieldSpec.type === 'date' ? <DateField /> : <StringField />}
                </Field>
              </Col>
            );
          })}
        </Row>
      </div>
    );
  }

  return null;
};
