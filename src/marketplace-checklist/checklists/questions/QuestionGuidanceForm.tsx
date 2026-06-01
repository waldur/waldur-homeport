import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { Alert, Form, Stack } from 'react-bootstrap';
import { FieldArray, FieldArrayRenderProps } from 'react-final-form-arrays';

import { required } from '@/core/validators';
import { SelectGroup, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { ChecklistQuestionForm } from '@/marketplace-checklist/types';
import { ActionButton } from '@/table/ActionButton';

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
              <SelectGroup
                name={`${name}.answer`}
                options={getOptions(i)}
                simpleValue
                validate={required}
                label={translate('Answer')}
                className="flex-grow-1"
              />

              <ActionButton
                action={() => removeRow(i)}
                iconNode={<TrashIcon weight="bold" />}
                variant="text-danger"
                className="mt-1"
              />
            </Stack>
            <TextGroup
              name={`${name}.solution`}
              placeholder={translate(
                'Add helpful guidance when users select specific answers that need correction or clarification...',
              )}
              validate={required}
              label={translate('Solution / Guidance')}
              spaceless={i === fields.length - 1}
            />
          </div>
        ))}
      </Form.Group>
      <div className="mt-3">
        <ActionButton
          action={addRow}
          title={translate('Add guidance')}
          iconNode={<PlusIcon weight="bold" />}
          variant="text-primary"
          disabled={addDisabled}
          disabledReason={translate('Complete all fields before adding more')}
        />
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
