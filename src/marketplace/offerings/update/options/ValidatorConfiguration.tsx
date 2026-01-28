import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { Field, useFormState } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';

import { BaseButton } from '@waldur/core/buttons/BaseButton';
import { CompactIconButton } from '@waldur/core/buttons/IconButton';
import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';

import { FormGroup } from '../../FormGroup';

const VALIDATOR_TYPES = [
  { value: 'gt', label: translate('Greater than') },
  { value: 'gte', label: translate('Greater than or equal') },
  { value: 'lt', label: translate('Less than') },
  { value: 'lte', label: translate('Less than or equal') },
];

interface ValidatorConfigurationProps {
  offering?: {
    options?: {
      options?: Record<string, { type: string; label: string; name?: string }>;
    };
  };
}

export const ValidatorConfiguration = ({
  offering,
}: ValidatorConfigurationProps) => {
  const { values } = useFormState({ subscription: { values: true } });
  const currentFieldName = values.name;

  // Get other integer fields that can be used as validation targets
  const targetFieldOptions = useMemo(() => {
    const options = offering?.options?.options;
    if (!options) return [];

    return Object.entries(options)
      .filter(
        ([key, opt]) => opt.type === 'integer' && key !== currentFieldName,
      )
      .map(([key, opt]) => ({
        value: key,
        label: opt.label || key,
      }));
  }, [offering?.options?.options, currentFieldName]);

  if (targetFieldOptions.length === 0) {
    return null;
  }

  return (
    <FormGroup
      label={translate('Cross-field validators')}
      description={translate(
        'Add validation rules comparing this field to other numeric fields',
      )}
    >
      <FieldArray name="validators">
        {({ fields }) => (
          <div className="d-flex flex-column gap-3">
            {fields.map((name, index) => (
              <div key={name} className="d-flex gap-2 align-items-center">
                <div className="flex-grow-1">
                  <Field
                    name={`${name}.type`}
                    render={(fieldProps) => (
                      <Select
                        value={
                          VALIDATOR_TYPES.find(
                            (opt) =>
                              opt.value === fieldProps.input.value?.value,
                          ) || fieldProps.input.value
                        }
                        onChange={fieldProps.input.onChange}
                        options={VALIDATOR_TYPES}
                        placeholder={translate('Validator type')}
                        isClearable={false}
                      />
                    )}
                  />
                </div>
                <div className="flex-grow-1">
                  <Field
                    name={`${name}.target_field`}
                    render={(fieldProps) => (
                      <Select
                        value={
                          targetFieldOptions.find(
                            (opt) =>
                              opt.value === fieldProps.input.value?.value,
                          ) || fieldProps.input.value
                        }
                        onChange={fieldProps.input.onChange}
                        options={targetFieldOptions}
                        placeholder={translate('Target field')}
                        isClearable={false}
                      />
                    )}
                  />
                </div>
                <CompactIconButton
                  variant="outline-danger"
                  onClick={() => fields.remove(index)}
                  iconNode={<TrashIcon weight="bold" />}
                  tooltip={translate('Remove validator')}
                />
              </div>
            ))}
            <BaseButton
              variant="outline-primary"
              size="sm"
              className="align-self-start"
              onClick={() =>
                fields.push({ type: VALIDATOR_TYPES[0], target_field: null })
              }
              iconNode={<PlusIcon className="me-1" weight="bold" />}
              label={translate('Add validator')}
            />
          </div>
        )}
      </FieldArray>
    </FormGroup>
  );
};
