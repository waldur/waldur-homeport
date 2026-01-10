import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { Card } from 'react-bootstrap';
import { Field } from 'redux-form';
import { FieldArray, WrappedFieldArrayProps } from 'redux-form';

import { required } from '@waldur/core/validators';
import { InputField } from '@waldur/form/InputField';
import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { ActionButton } from '@waldur/table/ActionButton';

import { FormGroup } from '../../FormGroup';

interface CascadeStep {
  name: string;
  label: string;
  type: string;
  depends_on?: string;
  choices?: string;
  choices_map?: string;
}

const STEP_TYPES = [
  { value: 'select_string', label: 'Select' },
  { value: 'select_string_multi', label: 'Select Multiple' },
];

const CascadeStepsGroup = ({ fields }: WrappedFieldArrayProps<CascadeStep>) => {
  const addStep = useCallback(() => {
    fields.push({
      name: '',
      label: '',
      type: 'select_string',
    });
  }, [fields]);

  const removeStep = useCallback(
    (index: number) => {
      fields.remove(index);
    },
    [fields],
  );

  const getAvailableDependencies = useCallback(
    (currentIndex: number) => {
      const dependencies = [];
      for (let i = 0; i < currentIndex; i++) {
        const step = fields.get(i);
        if (step?.name && step?.label) {
          dependencies.push({
            value: step.name,
            label: step.label,
          });
        }
      }
      return dependencies;
    },
    [fields],
  );

  return (
    <>
      {fields.map((name, index) => {
        const availableDependencies = getAvailableDependencies(index);
        const hasChoicesMap = fields.get(index)?.depends_on;

        return (
          <Card key={name} className="card-bordered bg-gray-50 mb-3">
            <Card.Header className="mx-4 min-h-auto">
              <h6 className="mb-0 text-gray">
                {translate('Step {index}', { index: index + 1 })}
              </h6>
              <div className="card-toolbar m-0">
                <ActionButton
                  variant="text-danger"
                  action={() => removeStep(index)}
                  disabled={fields.length <= 1}
                  iconNode={<TrashIcon weight="bold" />}
                />
              </div>
            </Card.Header>
            <Card.Body className="px-4">
              <FormGroup label={translate('Name')} required={true}>
                <Field
                  name={`${name}.name`}
                  component={InputField}
                  validate={required}
                  placeholder={translate('Internal field name (e.g., country)')}
                />
              </FormGroup>

              <FormGroup label={translate('Label')} required={true}>
                <Field
                  name={`${name}.label`}
                  component={InputField}
                  validate={required}
                  placeholder={translate('Display label (e.g., Country)')}
                />
              </FormGroup>

              <FormGroup label={translate('Type')} required={true}>
                <Field
                  name={`${name}.type`}
                  validate={required}
                  component={(fieldProps) => (
                    <Select
                      value={STEP_TYPES.find(
                        (opt) => opt.value === fieldProps.input.value,
                      )}
                      onChange={(option) =>
                        fieldProps.input.onChange(option?.value)
                      }
                      options={STEP_TYPES}
                      isClearable={false}
                      getOptionValue={(option) => option.value}
                      getOptionLabel={(option) => option.label}
                    />
                  )}
                />
              </FormGroup>

              {availableDependencies.length > 0 && (
                <FormGroup
                  label={translate('Depends on')}
                  description={translate(
                    'Make this step dependent on previous selection',
                  )}
                >
                  <Field
                    name={`${name}.depends_on`}
                    component={(fieldProps) => (
                      <Select
                        value={availableDependencies.find(
                          (opt) => opt.value === fieldProps.input.value,
                        )}
                        onChange={(option) =>
                          fieldProps.input.onChange(option?.value)
                        }
                        options={availableDependencies}
                        isClearable={true}
                        placeholder={translate('Select dependency')}
                        getOptionValue={(option) => option.value}
                        getOptionLabel={(option) => option.label}
                      />
                    )}
                  />
                </FormGroup>
              )}

              {!hasChoicesMap ? (
                <FormGroup
                  label={translate('Choices')}
                  description={translate(
                    'JSON array of choice objects with value and label properties',
                  )}
                  required={true}
                >
                  <Field
                    name={`${name}.choices`}
                    component={InputField}
                    as="textarea"
                    rows={4}
                    validate={required}
                    placeholder={translate(
                      '[{"value": "us", "label": "United States"}, {"value": "eu", "label": "European Union"}]',
                    )}
                  />
                </FormGroup>
              ) : (
                <FormGroup
                  label={translate('Choices Map')}
                  description={translate(
                    'JSON object mapping parent values to choice arrays',
                  )}
                  required={true}
                >
                  <Field
                    name={`${name}.choices_map`}
                    component={InputField}
                    as="textarea"
                    rows={6}
                    validate={required}
                    placeholder={translate(
                      'Example:\n{"parent_value_1": [{"value": "child_1", "label": "Child 1"}], "parent_value_2": [{"value": "child_2", "label": "Child 2"}]}',
                    )}
                  />
                </FormGroup>
              )}
            </Card.Body>
          </Card>
        );
      })}

      <div>
        <ActionButton
          variant="text-primary"
          action={addStep}
          iconNode={<PlusIcon weight="bold" />}
          title={translate('Add step')}
        />
      </div>
    </>
  );
};

export const ConditionalCascadeConfiguration = ({ name }) => {
  return (
    <FormGroup
      label={translate('Cascade Configuration')}
      description={translate(
        'Configure the steps and dependencies for the conditional cascade',
      )}
    >
      <FieldArray name={`${name}.steps`} component={CascadeStepsGroup} />
    </FormGroup>
  );
};
