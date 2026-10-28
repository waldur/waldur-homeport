import { FunctionComponent } from 'react';

import { LoadingSpinner } from 'waldur-ui';

import { composeValidators, required } from '@/core/validators';
import { StringGroup, DateGroup } from '@/form';
import { translate } from '@/i18n';

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
      <div className="text-center py-3">
        <LoadingSpinner
          size={32}
          className="text-brand"
          aria-label={translate('Loading...')}
        />
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
    const validate = person_identifier_fields.pattern
      ? composeValidators(required, (value) => {
          const regex = new RegExp(person_identifier_fields.pattern);
          return regex.test(value)
            ? undefined
            : translate(
                'Invalid format. {}',
                person_identifier_fields.help_text || '',
              );
        })
      : required;

    return (
      <div className="mb-3">
        <h6 className="mb-2.5">
          {translate('Personal identification required')}
        </h6>
        {person_identifier_fields.description && (
          <p className="text-quaternary mb-2.5">
            {person_identifier_fields.description}
          </p>
        )}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <StringGroup
              name={fieldName}
              label={person_identifier_fields.label}
              required={true}
              validate={validate}
              description={person_identifier_fields.help_text}
              placeholder={person_identifier_fields.example}
            />
          </div>
        </div>
      </div>
    );
  }

  // Handle object type (multiple fields)
  if (person_identifier_fields.type === 'object') {
    const fields = person_identifier_fields.fields;
    const fieldEntries = Object.entries(fields);
    const totalFields = fieldEntries.length;

    return (
      <div>
        <h6 className="mb-2.5">
          {translate('Personal identification required')}
        </h6>
        {person_identifier_fields.description && (
          <p className="text-quaternary mb-2.5">
            {person_identifier_fields.description}
          </p>
        )}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {fieldEntries.map(([fieldKey, fieldSpec], index) => {
            const fieldName = `person_identifier_${fieldKey}`;
            const validate = fieldSpec.required ? required : undefined;
            const isLastOdd =
              totalFields % 2 !== 0 && index === totalFields - 1;

            return (
              <div
                className={isLastOdd ? 'md:col-span-2' : undefined}
                key={fieldKey}
              >
                {fieldSpec.type === 'date' ? (
                  <DateGroup
                    name={fieldName}
                    label={fieldSpec.label}
                    required={fieldSpec.required}
                    validate={validate}
                    description={fieldSpec.description}
                    placeholder={fieldSpec.example}
                    spaceless
                  />
                ) : (
                  <StringGroup
                    name={fieldName}
                    label={fieldSpec.label}
                    required={fieldSpec.required}
                    validate={validate}
                    description={fieldSpec.description}
                    placeholder={fieldSpec.example}
                    maxLength={fieldSpec.max_length}
                    spaceless
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
};
