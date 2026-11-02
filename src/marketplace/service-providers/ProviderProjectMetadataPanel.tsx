import { Answer, ProjectMetadataAnswer, QuestionAdmin } from 'waldur-js-client';

import { PropertyCard, PropertyItem, PropertyList } from 'waldur-ui';

import { formatDateTime } from '@/core/dateUtils';
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
    <PropertyCard title={translate('Project metadata')}>
      {hasAnswers ? (
        <PropertyList detailsMode>
          {answers.map((item) => (
            <PropertyItem
              key={item.question_uuid}
              label={item.question}
              value={
                <>
                  {/* Reuse the project-metadata answer renderer (handles files,
                      multi-file attachments, booleans, etc.). Select-type labels
                      are already resolved by the backend, so options are omitted. */}
                  <ParsedAnswer
                    question={
                      {
                        question_type: item.question_type,
                        question_options: [],
                      } as unknown as QuestionAdmin
                    }
                    answer={{ answer_data: item.answer } as unknown as Answer}
                  />
                  {item.modified && (
                    <div className="text-quaternary text-xs">
                      {translate('Last updated:')}{' '}
                      {formatDateTime(item.modified)}
                    </div>
                  )}
                </>
              }
            />
          ))}
        </PropertyList>
      ) : (
        <NoResult
          title={translate('No project metadata')}
          message={translate(
            'The consumer has not filled in any project metadata answers.',
          )}
          noAction
        />
      )}
    </PropertyCard>
  );
};
