import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { Alert, Button, Form, Stack } from 'react-bootstrap';
import { Field } from 'react-final-form';
import { FieldArray, FieldArrayRenderProps } from 'react-final-form-arrays';

import { required } from '@waldur/core/validators';
import { SelectField, TextField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { ChecklistQuestionForm } from '@waldur/marketplace-checklist/types';

interface FieldValue {
  answer?;
  solution?;
}

const FieldsListGroup = ({
  fields,
  values,
}: FieldArrayRenderProps<FieldValue, HTMLElement> & {
  values: ChecklistQuestionForm;
}) => {
  const addDisabled =
    fields.value?.some((v) => !v.answer || !v.solution) ||
    values.guidance?.length >= values.options?.length;

  const addRow = () => {
    if (!addDisabled) fields.push({});
  };

  const removeRow = (index: number) => fields.remove(index);

  if (!['multi_select', 'single_select'].includes(values.question_type)) {
    return (
      <Alert variant="warning">
        {translate(
          'This section is only for single select and multi select questions.',
        )}
      </Alert>
    );
  }

  const getOptions = useCallback(
    (index) =>
      values.options
        ? values.options
            .filter(
              (opt) =>
                opt &&
                !values.guidance?.some?.(
                  (g, i) => i !== index && g.answer === opt,
                ),
            )
            .map((opt) => ({ label: opt, value: opt }))
        : [],
    [values.options, values.guidance],
  );

  return (
    <>
      <Form.Group>
        {fields.map((name, i) => (
          <div
            key={name + i}
            className={i + 1 < fields.length ? 'border-bottom mb-3' : undefined}
          >
            <Stack direction="horizontal" gap={3}>
              <FormGroup label={translate('Answer')} className="flex-grow-1">
                <Field
                  component={SelectField}
                  name={`${name}.answer`}
                  options={getOptions(i)}
                  simpleValue
                  validate={required}
                />
              </FormGroup>

              <Button
                variant="text-danger"
                className="btn-icon mt-1"
                size="lg"
                onClick={() => removeRow(i)}
              >
                <span className="svg-icon svg-icon-1">
                  <TrashIcon weight="bold" />
                </span>
              </Button>
            </Stack>
            <FormGroup
              label={translate('Solution / Guidance')}
              spaceless={i === fields.length - 1}
            >
              <Field
                component={TextField as any}
                name={`${name}.solution`}
                placeholder={translate(
                  'Add helpful guidance when users select specific answers that need correction or clarification...',
                )}
                validate={required}
              />
            </FormGroup>
          </div>
        ))}
      </Form.Group>
      <div className="mt-3">
        <Button variant="text-primary" onClick={addRow} disabled={addDisabled}>
          <span className="svg-icon svg-icon-2">
            <PlusIcon weight="bold" />
          </span>
          {translate('Add guidance')}
        </Button>
      </div>
    </>
  );
};

export const QuestionGuidanceForm = ({
  values,
}: {
  values: ChecklistQuestionForm;
}) => {
  return (
    <FieldArray
      name="guidance"
      component={FieldsListGroup}
      rerenderOnEveryChange
      values={values}
    />
  );
};
