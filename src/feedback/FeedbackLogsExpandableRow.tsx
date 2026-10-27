import { FeedbackRequest, QuestionAdmin } from 'waldur-js-client';

import { ParsedAnswer } from '@/project/metadata/ParsedAnswer';
import { Field } from '@/resource/summary';
import { ExpandableContainer } from '@/table/ExpandableContainer';

import { formatScaleAnswer } from './answers';

export const FeedbackLogsExpandableRow = ({
  row,
}: {
  row: FeedbackRequest;
}) => (
  <ExpandableContainer asTable>
    {row.answers.map((answer) => (
      <Field
        key={answer.question_uuid}
        // A question already ends in "?" and is shown in full, so skip
        // Field's trailing colon and truncation tooltip.
        label={<span>{answer.question}</span>}
        value={
          formatScaleAnswer(answer) ?? (
            <ParsedAnswer
              question={
                { question_type: answer.question_type } as QuestionAdmin
              }
              answer={{ answer_data: answer.answer } as any}
            />
          )
        }
      />
    ))}
  </ExpandableContainer>
);
