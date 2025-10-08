import { FORM_ERROR } from 'final-form';
import { ComponentType, FC, useMemo } from 'react';
import { Field, Form } from 'react-final-form';
import {
  Answer,
  projectsSubmitAnswers,
  QuestionAdmin,
  QuestionTypeEnum,
} from 'waldur-js-client';

import { formDataOptions } from '@waldur/core/api';
import {
  FieldError,
  FileUploadField,
  NumberField,
  SelectField,
  StringField,
  SubmitButton,
  TextField,
} from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { DateField } from '@waldur/form/DateField';
import { FormFieldError } from '@waldur/form/FormFieldError';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';

interface AnswerFormDialogProps {
  resolve: {
    question: QuestionAdmin;
    projectUuid: string;
    /** For edit mode */
    answer?: Answer;
    /** If not set, the question will replaced as title */
    title?: string;
    refetch?(): void;
  };
}

const questionComponent: Record<QuestionTypeEnum, ComponentType> = {
  text_input: StringField,
  text_area: TextField,
  boolean: AwesomeCheckboxField,
  number: NumberField,
  date: DateField,
  single_select: SelectField,
  multi_select: SelectField,
  file: FileUploadField,
};

export const AnswerFormDialog: FC<AnswerFormDialogProps> = ({ resolve }) => {
  const { showSuccess, showErrorResponse } = useNotify();
  const { closeDialog } = useModal();

  const question = resolve.question;

  const onSubmit = async (formData: { answer_data }) => {
    let answer = formData.answer_data;
    if (question.question_type === 'number' && answer) {
      answer = Number(answer);
    } else if (question.question_type === 'single_select' && answer) {
      answer = [answer];
    }

    if (
      ['single_select', 'multi_select'].includes(question.question_type) &&
      !answer?.length
    ) {
      answer = null;
    }

    try {
      await projectsSubmitAnswers({
        path: { uuid: resolve.projectUuid },
        body: [
          {
            question_uuid: question.uuid,
            answer_data: answer ?? null,
          },
        ],
        ...(question.question_type === 'file' ? formDataOptions : {}),
      });
      if (resolve.answer?.uuid) {
        showSuccess(translate('Answer submitted.'));
      } else {
        showSuccess(translate('Answer has been updated.'));
      }
      if (resolve.refetch) resolve.refetch();
      closeDialog();
    } catch (e) {
      showErrorResponse(e, translate('Unable to submit answer'));
      if (e.response && e.response.status === 400) {
        return { [FORM_ERROR]: e };
      }
      if (e?.[0]?.non_field_errors) {
        return { [FORM_ERROR]: e?.[0]?.non_field_errors };
      }
    }
  };

  const isSelectType = ['single_select', 'multi_select'].includes(
    question.question_type,
  );

  const initialValues = resolve.answer
    ? question.question_type === 'single_select'
      ? { answer_data: resolve.answer.answer_data?.[0] }
      : { answer_data: resolve.answer.answer_data }
    : undefined;

  const numberValidator = useMemo(
    () => (value) => {
      const v = Number(value);
      if ((!v && v !== 0) || question.question_type !== 'number')
        return undefined;
      const max = question.max_value ? Number(question.max_value) : null;
      const min = question.min_value ? Number(question.min_value) : null;

      if (min !== null && max !== null) {
        if (v < min || v > max) {
          return translate('Must be between {n} and {m}.', {
            n: Number(min),
            m: Number(max),
          });
        }
      } else if (min !== null && v < min) {
        return translate('Must be greater than or equal to {n}.', {
          n: Number(min),
        });
      } else if (max !== null && v > max) {
        return translate('Must be less than or equal to {n}.', {
          n: Number(max),
        });
      }
      return undefined;
    },
    [question],
  );

  return (
    <Form onSubmit={onSubmit} initialValues={initialValues}>
      {({
        invalid,
        handleSubmit,
        submitting,
        submitError,
        modifiedSinceLastSubmit,
      }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={resolve.title || question.description}
            closeButton
            footer={
              <>
                <CloseDialogButton className="min-w-125px" />
                <SubmitButton
                  disabled={invalid && !modifiedSinceLastSubmit}
                  submitting={submitting}
                  label={translate('Save')}
                  className="btn btn-primary min-w-125px"
                />
              </>
            }
          >
            <FormGroup
              label={resolve.title ? question.description : undefined}
              required={question.required}
              spaceless
            >
              <Field
                name="answer_data"
                placeholder={
                  ['text_input', 'text_area'].includes(question.question_type)
                    ? translate('Answer')
                    : question.question_type === 'number'
                      ? '0'
                      : undefined
                }
                component={
                  (questionComponent[question.question_type] ||
                    StringField) as any
                }
                options={isSelectType ? question.question_options : undefined}
                getOptionValue={isSelectType ? (opt) => opt.uuid : undefined}
                simpleValue={isSelectType || undefined}
                isMulti={
                  isSelectType
                    ? question.question_type === 'multi_select'
                    : undefined
                }
                isClearable={isSelectType ? !question.required : undefined}
                showFileName={question.question_type === 'file' || undefined}
                buttonLabel={
                  question.question_type === 'file'
                    ? translate('Browse')
                    : undefined
                }
                validate={numberValidator}
              />
              <FormFieldError name="answer_data" />
            </FormGroup>

            {submitError && <FieldError error={submitError} />}
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
