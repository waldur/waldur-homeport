import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { Alert, Button, Card } from 'react-bootstrap';
import { Field } from 'react-final-form';
import { FieldArray, FieldArrayRenderProps } from 'react-final-form-arrays';
import {
  checklistsAdminQuestionsList,
  ChecklistOperators,
  QuestionAdmin,
} from 'waldur-js-client';

import { CustomRadioButton } from '@waldur/core/CustomRadioButton';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { required } from '@waldur/core/validators';
import { SelectField } from '@waldur/form';
import { CommaSeparatedListField } from '@waldur/form/CommaSeparatedListField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { questionConditionOperatorOptions } from '@waldur/marketplace-checklist/utils';

interface FieldValue {
  depends_on_question?;
  operator?: ChecklistOperators;
  required_answer_value?;
}

const FieldsListGroup = ({
  fields,
  questions,
}: FieldArrayRenderProps<FieldValue, HTMLElement> & {
  questions: QuestionAdmin[];
}) => {
  const addDisabled =
    fields.value?.some(
      (v) => !v.depends_on_question || !v.operator || !v.required_answer_value,
    ) || fields?.length >= questions?.length;

  const addRow = () => {
    if (!addDisabled) fields.push({});
  };

  const removeRow = (index: number) => fields.remove(index);

  const getOptions = useCallback(
    (index) =>
      questions
        ? questions.filter(
            (q) =>
              q &&
              !fields.value?.some?.(
                (value, i) =>
                  i !== index && value.depends_on_question === q.url,
              ),
          )
        : [],
    [questions, fields],
  );

  return (
    <>
      <div className="mb-2">
        <Field
          name="conditions_operator"
          render={({ input }) => (
            <CustomRadioButton
              label={translate(
                'When multiple conditions exist, show this question if:',
              )}
              choices={[
                {
                  label: translate('All conditions match') + ' (AND)',
                  value: 'and',
                },
                {
                  label: translate('Any condition matches') + ' (OR)',
                  value: 'or',
                },
              ]}
              direction="horizontal"
              align="left"
              input={input as any}
              disabled={fields.length < 2}
              tooltip={
                fields.length < 2
                  ? translate(
                      'Add more conditions to configure logic combination',
                    )
                  : undefined
              }
            />
          )}
        />
      </div>
      {fields.map((name, i) => (
        <Card key={name} className="card-bordered bg-gray-50 mb-3">
          <Card.Header className="mx-4 min-h-auto">
            <h6 className="mb-0 text-gray">
              {translate('Condition') + ' ' + (i + 1)}
            </h6>
            <div className="card-toolbar m-0">
              <Button
                variant="active-light-danger"
                className="btn-icon btn-icon-danger"
                onClick={() => removeRow(i)}
              >
                <span className="svg-icon svg-icon-1">
                  <TrashIcon weight="bold" />
                </span>
              </Button>
            </div>
          </Card.Header>
          <Card.Body key={name + i} className="px-4">
            <FormGroup
              label={translate('Depends on question')}
              description={translate(
                'Only show this question based on previous answers',
              )}
            >
              <Field
                component={SelectField}
                name={`${name}.depends_on_question`}
                options={getOptions(i)}
                getOptionValue={(option) => option.url}
                getOptionLabel={(option) => option.description}
                simpleValue
                validate={required}
              />
            </FormGroup>
            <FormGroup label={translate('Condition')}>
              <Field
                component={SelectField}
                name={`${name}.operator`}
                options={questionConditionOperatorOptions}
                simpleValue
                validate={required}
              />
            </FormGroup>
            <FormGroup
              label={translate('Value')}
              description={translate(
                'Comma separated values that trigger this question',
              )}
              spaceless
            >
              <Field
                component={CommaSeparatedListField as any}
                name={`${name}.required_answer_value`}
                validate={required}
              />
            </FormGroup>
          </Card.Body>
        </Card>
      ))}
      <div>
        <Button
          variant="active-secondary"
          className="btn-text-primary btn-icon-primary"
          onClick={addRow}
          disabled={addDisabled}
        >
          <span className="svg-icon svg-icon-2">
            <PlusIcon weight="bold" />
          </span>
          {translate('Add condition')}
        </Button>
      </div>
    </>
  );
};

export const QuestionVisibilityForm = ({
  checklistUuid,
}: {
  checklistUuid: string;
}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['ChecklistQuestions', checklistUuid],
    queryFn: () =>
      checklistsAdminQuestionsList({
        query: { checklist_uuid: checklistUuid },
      }).then((res) => res.data),
    staleTime: 3 * 60 * 1000,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  } else if (error) {
    return <LoadingErred loadData={refetch} />;
  }

  if (!data.length) {
    return (
      <Alert variant="warning">
        {translate('There are no questions in this checklist yet.')}
      </Alert>
    );
  }

  return (
    <FieldArray
      name="conditions"
      component={FieldsListGroup}
      rerenderOnEveryChange
      questions={data}
    />
  );
};
