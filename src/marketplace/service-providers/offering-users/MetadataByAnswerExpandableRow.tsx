import { FC, useEffect } from 'react';
import { Answer, QuestionAdmin } from 'waldur-js-client';

import { translate } from '@/i18n';
import { BooleanIconBadge } from '@/project/metadata/BooleanIconBadge';
import { ParsedAnswer } from '@/project/metadata/ParsedAnswer';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { AnswerRowActions } from './AnswerRowActions';

interface QuestionWithUserAnswers {
  question_uuid: string;
  question_description: string;
  question_type: QuestionAdmin['question_type'];
  question_options?: QuestionAdmin['question_options'];
  question_max_value?: QuestionAdmin['max_value'];
  question_min_value?: QuestionAdmin['min_value'];
  required: boolean;
  order: number;
  offering_answers: Array<{
    offering_uuid: string;
    offering_name: string;
    offering_user_uuid: string;
    answer_uuid: string;
    answer_data: any;
    answered_by: string;
    answered_by_email: string;
    answered_at: string;
    requires_review: boolean;
  }>;
}

const dummyData = [
  {
    offering_uuid: '33c8b0b5e5024c57bbadd7af80cd3f65',
    offering_name: 'Offering 1',
    offering_user_uuid: 'c8b0b5d7afe5024c57bbad80cd3f6533',
    answer_uuid: 'b2ba7f2306ce4aeaaf9a041684956a5d',
    answer_data: ['98935c20fbe446f582a4e8d747bcce23'],
    answer_labels: 'food',
    answered_by: 'Admin Lastname',
    answered_by_email: 'example@test.com',
    answered_at: '2025-09-02T08:34:43.510756+00:00',
    requires_review: false,
  },
  {
    offering_uuid: '89742f3a00f3496a80c27a57e5999abd',
    offering_name: 'new offering',
    offering_user_uuid: '742f3a7a5700f3496a80c2e5999abd89',
    answer_uuid: '3d676f2eeb774d3489b7fb258f6816a8',
    answer_data: ['8faaa574ade44db29927e5aea612e9c2'],
    answer_labels: 'noise',
    answered_by: 'Admin Lastname',
    answered_by_email: 'example@test.com',
    answered_at: '2025-08-29T09:03:16.653907+00:00',
    requires_review: false,
  },
];

const getAnswer = (
  row: QuestionWithUserAnswers['offering_answers'][0],
  question,
) =>
  ({
    uuid: row.answer_uuid,
    answer_data: row.answer_data,
    requires_review: row.requires_review,
    question_description: question.description,
  }) as Answer;

export const MetadataByAnswerExpandableRow: FC<{
  row: QuestionWithUserAnswers;
  fetch(): void;
}> = ({ row: data, fetch }) => {
  const tableProps = useTable({
    table: 'OfferingsMetadata-' + data.question_uuid,
    fetchData: () => Promise.resolve({ rows: dummyData }),
  });

  useEffect(() => {
    tableProps.fetch();
  }, [data]);

  const question = {
    uuid: data.question_uuid,
    description: data.question_description,
    question_type: data.question_type,
    question_options: data.question_options || [],
    max_value: data.question_max_value,
    min_value: data.question_min_value,
  } as QuestionAdmin;

  return (
    <ExpandableContainer>
      <Table<QuestionWithUserAnswers['offering_answers'][0]>
        {...tableProps}
        columns={[
          {
            title: translate('Offering'),
            render: ({ row }) => row.offering_name,
          },
          {
            title: translate('User'),
            render: ({ row }) => (
              <div>
                <span className="d-block text-dark">{row.answered_by}</span>
                <span className="d-block text-muted">
                  {row.answered_by_email}
                </span>
              </div>
            ),
          },
          {
            title: translate('Answer'),
            render: ({ row }) => (
              <ParsedAnswer
                question={question}
                answer={getAnswer(row, question)}
              />
            ),
          },
          {
            title: translate('Needs review'),
            render: ({ row }) => (
              <BooleanIconBadge value={row.requires_review} />
            ),
          },
        ]}
        verboseName={translate('Answers')}
        hasActionBar={false}
        minHeight="auto"
        rowActions={({ row }) => (
          <AnswerRowActions
            row={getAnswer(row, question)}
            offeringUserUuid={row.offering_user_uuid}
            question={question}
            fetch={fetch}
          />
        )}
      />
    </ExpandableContainer>
  );
};
