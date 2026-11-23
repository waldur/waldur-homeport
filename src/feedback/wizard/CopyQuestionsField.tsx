import { FC, useMemo, useState } from 'react';
import { useForm } from 'react-final-form';
import {
  FeedbackSurvey,
  feedbackSurveysList,
  feedbackSurveysRetrieve,
} from 'waldur-js-client';

import { formatDate } from '@/core/dateUtils';
import { AsyncSelectGroup } from '@/form';
import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';

import { copyQuestions, fromSurveyQuestion } from './localQuestions';
import { LocalQuestion } from './types';

// The picker is a field of the wizard form, so it is cleared after each copy:
// the survey payload must not carry it, and the same survey can be picked again.
const FIELD = 'copy_questions_from';

export const CopyQuestionsField: FC<{
  onCopy(questions: LocalQuestion[]): void;
  // The survey being edited, which has nothing to copy into itself.
  surveyUuid?: string;
}> = ({ onCopy, surveyUuid }) => {
  const form = useForm<{
    questions?: LocalQuestion[];
    [FIELD]?: FeedbackSurvey;
  }>();
  const { showErrorResponse, showInfo } = useNotify();
  const [copying, setCopying] = useState(false);

  const loadOptions = useMemo(
    () => createLoadOptions(feedbackSurveysList, 'name', { o: ['-starts_at'] }),
    [],
  );

  const copy = async (survey: FeedbackSurvey | null) => {
    if (!survey) return;
    setCopying(true);
    try {
      const { data } = await feedbackSurveysRetrieve({
        path: { uuid: survey.uuid },
      });
      const { questions, skipped } = copyQuestions(
        form.getState().values.questions ?? [],
        (data.questions ?? []).map(fromSurveyQuestion),
      );
      onCopy(questions);
      if (skipped.length) {
        showInfo(
          translate('Already in this survey, so not copied: {questions}', {
            questions: skipped.join(', '),
          }),
        );
      }
    } catch (error) {
      showErrorResponse(error, translate('Unable to copy the questions.'));
    } finally {
      setCopying(false);
      form.change(FIELD, undefined);
    }
  };

  return (
    <AsyncSelectGroup
      name={FIELD}
      label={translate('Copy questions from another survey')}
      description={translate('Its questions are added after the ones above.')}
      tooltip={translate(
        'A question whose text is already in this survey is not copied, as each question needs its own text. Copied questions that depend on it are shown depending on the one already here.',
      )}
      loadOptions={loadOptions}
      getOptionLabel={(option: FeedbackSurvey) =>
        `${option.name} (${formatDate(option.starts_at)})`
      }
      getOptionValue={(option: FeedbackSurvey) => option.uuid}
      filterOption={(option: { data?: FeedbackSurvey }) =>
        option.data?.uuid !== surveyUuid
      }
      onChange={copy}
      isDisabled={copying}
      isLoading={copying}
      spaceless
    />
  );
};
