import { Answer, ProjectMetadataAnswer, QuestionAdmin } from 'waldur-js-client';

import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';
import { ParsedAnswer } from '@/project/metadata/ParsedAnswer';

interface ProviderProjectMetadataPanelProps {
  answers: ProjectMetadataAnswer[];
}

export const ProviderProjectMetadataPanel = ({
  answers,
}: ProviderProjectMetadataPanelProps) => {
  const hasAnswers = answers && answers.length > 0;

  return (
    <FormTable.Card title={translate('Project metadata')}>
      {hasAnswers ? (
        <FormTable detailsMode>
          {answers.map((item) => (
            <FormTable.Item
              key={item.question_uuid}
              label={item.question}
              value={
                // Reuse the project-metadata answer renderer (handles files,
                // multi-file attachments, booleans, etc.). Select-type labels
                // are already resolved by the backend, so options are omitted.
                <ParsedAnswer
                  question={
                    {
                      question_type: item.question_type,
                      question_options: [],
                    } as unknown as QuestionAdmin
                  }
                  answer={{ answer_data: item.answer } as unknown as Answer}
                />
              }
            />
          ))}
        </FormTable>
      ) : (
        <NoResult
          title={translate('No project metadata')}
          message={translate(
            'The consumer has not filled in any project metadata answers.',
          )}
          noAction
        />
      )}
    </FormTable.Card>
  );
};
