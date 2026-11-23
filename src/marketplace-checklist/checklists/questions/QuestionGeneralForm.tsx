import { useState } from 'react';
import { Checklist } from 'waldur-js-client';

import { ButtonCaret } from 'waldur-ui';

import { AtLeast } from '@/core/types';
import { required } from '@/core/validators';
import {
  StringGroup,
  TextGroup,
  SelectGroup,
  BooleanGroup,
  NumberGroup,
} from '@/form';
import { translate } from '@/i18n';
import { LikertPreview } from '@/marketplace-checklist/LikertField';
import { ChecklistQuestionForm } from '@/marketplace-checklist/types';
import {
  isQuestionFileType,
  questionTypeOptions,
  RANGE_QUESTION_TYPES,
} from '@/marketplace-checklist/utils';

import { QuestionAnswerOptions } from './QuestionAnswerOptions';
import { QuestionFileFields } from './QuestionFileFields';
import { QuestionLikertFields } from './QuestionLikertFields';
import { QuestionRichTextFields } from './QuestionRichTextFields';

// The server refuses a question of only spaces as blank.
const requiredText = (value) =>
  required(typeof value === 'string' ? value.trim() : value);

const isBlank = (value) =>
  value === null || value === undefined || value === '';

// Either bound may be left out; equal bounds are allowed, as on the server.
const notBelowMin = (value, allValues) =>
  !isBlank(value) &&
  !isBlank(allValues.min_value) &&
  Number(value) < Number(allValues.min_value)
    ? translate('Maximum value cannot be less than the minimum value.')
    : undefined;

// Unsaved questions have nowhere to keep uploads yet.
const localQuestionTypeOptions = questionTypeOptions.filter(
  (option) => !isQuestionFileType(option.value),
);

export const QuestionGeneralForm = ({
  values,
  checklist,
  local,
}: {
  values: ChecklistQuestionForm;
  checklist?: AtLeast<Checklist, 'uuid' | 'url' | 'checklist_type'>;
  // The list a local question sits in sets its order.
  local?: boolean;
}) => {
  const isOnboardingCustomer =
    checklist?.checklist_type === 'onboarding_customer';
  const isOnboardingIntent = checklist?.checklist_type === 'onboarding_intent';
  const [previewOpen, setPreviewOpen] = useState(true);

  return (
    <>
      <StringGroup
        name="description"
        placeholder={translate('Type your question here...')}
        maxLength={150}
        validate={requiredText}
        label={translate('Question')}
        required
        space={4}
      />
      <TextGroup
        name="user_guidance"
        placeholder={translate('Input placeholder help text for user...')}
        maxLength={300}
        label={translate('User guidance')}
        space={4}
      />
      <SelectGroup
        name="question_type"
        options={local ? localQuestionTypeOptions : questionTypeOptions}
        validate={required}
        simpleValue
        label={translate('Question type')}
        required
        space={4}
      />
      <BooleanGroup
        name="required"
        label={translate('Is required?')}
        space={4}
      />
      {!local && (
        <NumberGroup
          name="order"
          placeholder="0"
          min={0}
          label={translate('Question order')}
          space={4}
        />
      )}
      {['single_select', 'multi_select'].includes(values.question_type) ? (
        <QuestionAnswerOptions />
      ) : RANGE_QUESTION_TYPES.includes(values.question_type) ? (
        <>
          <NumberGroup
            name="min_value"
            placeholder="0"
            label={translate('Min value')}
            space={4}
          />
          <NumberGroup
            name="max_value"
            label={translate('Max value')}
            placeholder="0"
            validate={notBelowMin}
            space={4}
          />
        </>
      ) : values.question_type === 'likert' ? (
        <>
          <QuestionLikertFields />
          <hr className="my-4" />
          <div
            className="bg-tertiary dark:bg-quaternary border border-secondary rounded-lg p-2.5 mb-4"
            style={{ borderColor: 'var(--border-secondary)' }}
          >
            <div
              role="button"
              tabIndex={0}
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setPreviewOpen((v) => !v)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setPreviewOpen((v) => !v);
                }
              }}
              aria-expanded={previewOpen}
            >
              <span className="text-sm text-secondary font-semibold">
                {translate('Preview')}
              </span>
              <ButtonCaret isOpen={previewOpen} />
            </div>
            {previewOpen && (
              <>
                <hr className="my-2.5" />
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
        <StringGroup
          name="maps_to_customer_field"
          placeholder="e.g., vat_code"
          required
          label={translate('Customer field mapping for onboarding')}
          space={4}
          help={translate(
            "Customer model field name to map this answer to the Customer object (e.g., 'registration_code', 'email', 'vat_code').",
          )}
        />
      )}
      {isOnboardingIntent && (
        <StringGroup
          name="intent_field"
          placeholder="e.g., intent"
          required
          label={translate('Intent field mapping for onboarding')}
          space={4}
          help={translate(
            "Intent/purpose field to map the answer to the verification metadata (e.g., 'intent', 'registration_purpose').",
          )}
        />
      )}
    </>
  );
};
