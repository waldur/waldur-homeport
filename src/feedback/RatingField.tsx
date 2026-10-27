import { FieldRenderProps } from 'react-final-form';
import { QuestionAdmin } from 'waldur-js-client';

import { FieldError } from '@/form';
import { translate } from '@/i18n';
import { RateStars } from '@/proposals/proposal/create-review/RateStars';

type RatingQuestion = Pick<
  QuestionAdmin,
  'description' | 'min_value' | 'max_value'
>;

const getRatingMax = (question: RatingQuestion) =>
  question.max_value ? Number(question.max_value) : 5;

export const validateRating = (question: RatingQuestion) => (value) => {
  const min = question.min_value ? Number(question.min_value) : null;
  if (value != null && min !== null && Number(value) < min) {
    return translate('Choose at least {min} stars.', { min });
  }
  return undefined;
};

export const RatingField = ({
  input,
  meta,
  question,
}: FieldRenderProps<number> & { question: RatingQuestion }) => (
  <>
    <RateStars
      value={input.value}
      count={getRatingMax(question)}
      edit
      isHalf={false}
      size={28}
      onChange={input.onChange}
      label={question.description}
    />
    {/* The stars never blur, so a changed value counts as touched. */}
    {(meta.touched || meta.modified) && meta.error && (
      <FieldError error={meta.error} />
    )}
  </>
);
