import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { ComponentType, useCallback } from 'react';
import { Card } from 'react-bootstrap';
import { Field } from 'react-final-form';
import { FieldArray, FieldArrayRenderProps } from 'react-final-form-arrays';
import {
  checklistsAdminQuestionsList,
  ChecklistOperators,
  QuestionAdmin,
  QuestionTypeEnum,
} from 'waldur-js-client';

import { AwesomeRadioButton } from '@waldur/core/AwesomeRadioButton';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { required } from '@waldur/core/validators';
import { FileUploadField, NumberField, SelectField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { CommaSeparatedListField } from '@waldur/form/CommaSeparatedListField';
import { DateField } from '@waldur/form/DateField';
import { DateTimeField } from '@waldur/form/DateTimeField';
import { YearField } from '@waldur/form/YearField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { questionConditionOperatorOptions } from '@waldur/marketplace-checklist/utils';
import { NoResult } from '@waldur/navigation/header/search/NoResult';
import { ActionButton } from '@waldur/table/ActionButton';
import { CompactActionButton } from '@waldur/table/CompactActionButton';

interface FieldValue {
  depends_on_question?;
  operator?: ChecklistOperators;
  required_answer_value?;
}

const getConditionOptions = (questionType: QuestionTypeEnum) =>
  questionType
    ? questionConditionOperatorOptions.filter((opt) =>
        opt.compatible.includes(questionType),
      )
    : questionConditionOperatorOptions;

const questionComponent: Record<
  Exclude<QuestionTypeEnum, 'file'>,
  ComponentType
> = {
  text_input: CommaSeparatedListField,
  text_area: CommaSeparatedListField,
  boolean: AwesomeCheckboxField,
  number: NumberField,
  date: DateField,
  datetime: DateTimeField,
  single_select: SelectField,
  multi_select: SelectField,
  multiple_files: FileUploadField,
  url: CommaSeparatedListField,
  email: CommaSeparatedListField,
  country: CommaSeparatedListField,
  phone_number: CommaSeparatedListField,
  year: YearField,
  rating: NumberField,
};

const FieldsListGroup = ({
  fields,
  questions,
}: FieldArrayRenderProps<FieldValue, HTMLElement> & {
  questions: QuestionAdmin[];
}) => {
  const addDisabled =
    fields.value?.some(
      (v) =>
        !v.depends_on_question ||
        !v.operator ||
        (!v.required_answer_value &&
          ![false, 0].includes(v.required_answer_value)),
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
      <div className="mb-5">
        <Field
          name="dependency_logic_operator"
          defaultValue="and"
          render={({ input }) => (
            <AwesomeRadioButton
              label={translate(
                'When multiple conditions exist, show this question if:',
              )}
              choices={[
                {
                  label: translate('All conditions match (AND)'),
                  value: 'and',
                },
                {
                  label: translate('Any condition matches (OR)'),
                  value: 'or',
                },
              ]}
              direction="horizontal"
              justify="start"
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
      {fields.map((name, i) => {
        const selectedQuestion = questions.find(
          (q) => q.url === fields.value[i]?.depends_on_question,
        );

        const isSelectType = ['single_select', 'multi_select'].includes(
          selectedQuestion?.question_type,
        );

        return (
          <Card key={name} className="card-bordered bg-gray-50 mb-3">
            <Card.Header className="mx-4 min-h-auto">
              <h6 className="mb-0 text-gray">
                {translate('Condition {index}', { index: i + 1 })}
              </h6>
              <div className="card-toolbar m-0">
                <ActionButton
                  action={() => removeRow(i)}
                  iconNode={<TrashIcon weight="bold" />}
                  variant="text-danger"
                />
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
                  name={`${name}.depends_on_question`}
                  validate={required}
                  render={({ input, meta }) => (
                    <SelectField
                      input={{
                        ...input,
                        onChange: (value) => {
                          if (fields.value[i]?.depends_on_question !== value) {
                            const question = questions.find(
                              (q) => q.url === value,
                            );
                            fields.update(i, {
                              depends_on_question: value,
                              operator: undefined,
                              required_answer_value:
                                question.question_type === 'boolean'
                                  ? false
                                  : question.question_type === 'multi_select'
                                    ? []
                                    : undefined,
                            });
                          } else {
                            input.onChange(value);
                          }
                        },
                      }}
                      options={getOptions(i)}
                      getOptionValue={(option) => option.url}
                      getOptionLabel={(option) => option.description}
                      simpleValue
                      isInvalid={meta.touched && meta.error}
                    />
                  )}
                />
              </FormGroup>
              <FormGroup label={translate('Condition')}>
                <Field
                  component={SelectField}
                  name={`${name}.operator`}
                  options={getConditionOptions(selectedQuestion?.question_type)}
                  simpleValue
                  validate={required}
                  isDisabled={!fields.value[i]?.depends_on_question}
                />
              </FormGroup>
              <FormGroup
                label={translate('Value')}
                description={
                  ['text_area', 'text_input'].includes(
                    selectedQuestion?.question_type,
                  )
                    ? translate(
                        'Comma separated values that trigger this question',
                      )
                    : translate('Values that trigger this question')
                }
                spaceless
              >
                <Field
                  component={
                    (questionComponent[selectedQuestion?.question_type] ||
                      CommaSeparatedListField) as any
                  }
                  name={`${name}.required_answer_value`}
                  validate={required}
                  disabled={!fields.value[i]?.operator}
                  format={(value) =>
                    value && selectedQuestion?.question_type === 'single_select'
                      ? value[0]
                      : value
                  }
                  parse={(value) =>
                    selectedQuestion?.question_type === 'number'
                      ? Number(value)
                      : selectedQuestion?.question_type === 'single_select'
                        ? [value]
                        : value
                  }
                  {...(isSelectType
                    ? {
                        isDisabled: !fields.value[i]?.operator,
                        options: selectedQuestion?.question_options,
                        getOptionValue: (opt) => opt.uuid,
                        simpleValue: true,
                        isMulti:
                          selectedQuestion?.question_type === 'multi_select',
                      }
                    : {})}
                />
              </FormGroup>
            </Card.Body>
          </Card>
        );
      })}
      <div>
        <CompactActionButton
          action={addRow}
          title={translate('Add condition')}
          iconNode={<PlusIcon weight="bold" />}
          variant="text-primary"
          disabled={addDisabled}
        />
      </div>
    </>
  );
};

export const QuestionVisibilityForm = ({
  checklistUuid,
  question,
}: {
  checklistUuid: string;
  question?: QuestionAdmin;
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
      <NoResult
        title={translate('There are no questions in this checklist yet')}
        message={translate(
          'Please add questions to the checklist before setting visibility conditions.',
        )}
      />
    );
  }

  return (
    <FieldArray
      name="conditions"
      component={FieldsListGroup}
      rerenderOnEveryChange
      questions={data.filter((q) => q.uuid !== question?.uuid)}
    />
  );
};
