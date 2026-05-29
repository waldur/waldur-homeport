import { CaretDownIcon, CaretUpIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { Field } from 'react-final-form';
import { Checklist } from 'waldur-js-client';

import { AtLeast } from '@/core/types';
import { greaterThan, required } from '@/core/validators';
import { NumberField, SelectField, StringField, TextField } from '@/form';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { FormFieldError } from '@/form/FormFieldError';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { LikertPreview } from '@/marketplace-checklist/LikertField';
import { ChecklistQuestionForm } from '@/marketplace-checklist/types';
import { questionTypeOptions } from '@/marketplace-checklist/utils';

import { QuestionAnswerOptions } from './QuestionAnswerOptions';
import { QuestionFileFields } from './QuestionFileFields';
import { QuestionLikertFields } from './QuestionLikertFields';
import { QuestionRichTextFields } from './QuestionRichTextFields';

const gt = (value, allValues) =>
  greaterThan(Number(allValues.min_value))(Number(value));

export const QuestionGeneralForm = ({
  values,
  checklist,
}: {
  values: ChecklistQuestionForm;
  checklist?: AtLeast<Checklist, 'uuid' | 'url' | 'checklist_type'>;
}) => {
  const isOnboardingCustomer =
    checklist?.checklist_type === 'onboarding_customer';
  const isOnboardingIntent = checklist?.checklist_type === 'onboarding_intent';
  const [previewOpen, setPreviewOpen] = useState(true);

  return (
    <>
      <FormGroup label={translate('Question')} required space={5}>
        <Field
          name="description"
          component={StringField}
          placeholder={translate('Type your question here...')}
          maxLength={150}
          validate={required}
        />
      </FormGroup>

      <FormGroup label={translate('User guidance')} space={5}>
        <Field
          name="user_guidance"
          component={TextField}
          placeholder={translate('Input placeholder help text for user...')}
          maxLength={300}
        />
      </FormGroup>

      <FormGroup label={translate('Question type')} required space={5}>
        <Field
          name="question_type"
          component={SelectField}
          options={questionTypeOptions}
          validate={required}
          simpleValue
        />
      </FormGroup>

      <FormGroup space={5}>
        <Field
          name="required"
          component={AwesomeCheckboxField}
          label={translate('Is required?')}
        />
      </FormGroup>

      <FormGroup label={translate('Question order')} space={5}>
        <Field
          name="order"
          component={NumberField}
          label={translate('Question order')}
          placeholder="0"
          min={0}
        />
      </FormGroup>

      {['single_select', 'multi_select'].includes(values.question_type) ? (
        <QuestionAnswerOptions />
      ) : values.question_type === 'number' ? (
        <>
          <FormGroup label={translate('Min value')} space={5}>
            <Field name="min_value" component={NumberField} placeholder="0" />
          </FormGroup>
          <FormGroup label={translate('Max value')} space={5}>
            <Field
              name="max_value"
              component={NumberField}
              placeholder="0"
              validate={gt}
            />
            <FormFieldError name="max_value" />
          </FormGroup>
        </>
      ) : values.question_type === 'likert' ? (
        <>
          <QuestionLikertFields />
          <hr className="my-5" />
          <div
            className="bg-light border rounded p-3 mb-5"
            style={{ borderColor: 'var(--bs-border-color)' }}
          >
            <div
              role="button"
              tabIndex={0}
              className="d-flex justify-content-between align-items-center"
              style={{ cursor: 'pointer' }}
              onClick={() => setPreviewOpen((v) => !v)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setPreviewOpen((v) => !v);
                }
              }}
              aria-expanded={previewOpen}
            >
              <span className="fs-6 text-gray-700" style={{ fontWeight: 600 }}>
                {translate('Preview')}
              </span>
              {previewOpen ? (
                <CaretUpIcon weight="bold" size={20} />
              ) : (
                <CaretDownIcon weight="bold" size={20} />
              )}
            </div>
            {previewOpen && (
              <>
                <hr className="my-3" />
                <LikertPreview
                  config={{
                    likert_scale_length: values.likert_scale_length,
                    likert_low_label: values.likert_low_label,
                    likert_high_label: values.likert_high_label,
                    likert_allow_na: values.likert_allow_na,
                  }}
                />
              </>
            )}
          </div>
        </>
      ) : values.question_type === 'rich_text' ? (
        <QuestionRichTextFields />
      ) : ['file', 'multiple_files'].includes(values.question_type) ? (
        <QuestionFileFields
          multiple={values.question_type === 'multiple_files'}
        />
      ) : null}

      {isOnboardingCustomer && (
        <FormGroup
          label={translate('Customer field mapping for onboarding')}
          space={5}
          help={translate(
            "Customer model field name to map this answer to the Customer object (e.g., 'registration_code', 'email', 'vat_code').",
          )}
          required
        >
          <Field
            name="maps_to_customer_field"
            component={StringField}
            placeholder="e.g., vat_code"
            required
          />
        </FormGroup>
      )}

      {isOnboardingIntent && (
        <FormGroup
          label={translate('Intent field mapping for onboarding')}
          space={5}
          help={translate(
            "Intent/purpose field to map the answer to the verification metadata (e.g., 'intent', 'registration_purpose').",
          )}
          required
        >
          <Field
            name="intent_field"
            component={StringField}
            placeholder="e.g., intent"
            required
          />
        </FormGroup>
      )}
    </>
  );
};
