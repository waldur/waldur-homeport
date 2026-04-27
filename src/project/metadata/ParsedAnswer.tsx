import { FC } from 'react';
import { Answer, QuestionAdmin } from 'waldur-js-client';

import { BooleanBadge } from '@/core/BooleanBadge';
import { formatFilesize } from '@/core/utils';
import { renderFieldOrDash } from '@/table/utils';

interface ParsedAnswerProps {
  question: QuestionAdmin;
  answer: Answer;
}

// Check if the answer is a file upload object
const isFileUpload = (
  value: unknown,
): value is {
  name: string;
  size?: number;
  mime_type?: string;
  stored_file_id: string;
} => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'stored_file_id' in value &&
    'name' in value
  );
};

export const ParsedAnswer: FC<ParsedAnswerProps> = ({ question, answer }) => {
  let answerValue = answer?.answer_data as any;

  if (
    ['single_select', 'multi_select'].includes(question.question_type) &&
    Array.isArray(answerValue) &&
    question.question_options?.length
  ) {
    answerValue = question.question_options
      .filter((opt) => answerValue.includes(opt.uuid))
      .map((opt) => opt.label);
  }

  // Handle file upload answers
  if (isFileUpload(answerValue)) {
    const sizeText = answerValue.size
      ? ` (${formatFilesize(answerValue.size, 'B')})`
      : '';
    return (
      <>
        {answerValue.name}
        {sizeText}
      </>
    );
  }

  return answerValue || [0, false].includes(answerValue) ? (
    Array.isArray(answerValue) ? (
      renderFieldOrDash(answerValue.join(', '))
    ) : answerValue === true || answerValue === false ? (
      <BooleanBadge value={answerValue} />
    ) : (
      answerValue
    )
  ) : (
    'N/A'
  );
};
