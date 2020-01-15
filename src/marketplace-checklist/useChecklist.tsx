import { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { getAll, post } from '@waldur/core/api';
import { format } from '@waldur/core/ErrorMessageFormatter';
import { useQuery } from '@waldur/core/useQuery';
import { translate } from '@waldur/i18n';
import { showSuccess, showError } from '@waldur/store/coreSaga';

interface Answer {
  checklist_uuid: string;
  question_uuid: string;
  value: boolean;
}

const getData = async project => {
  const questions = await getAll('/marketplace-checklist-questions/');
  const answers = await getAll<Answer>('/marketplace-checklist-answers/',
  {params: {project_uuid: project.uuid}});
  return {questions, answers};
};

export const useChecklist = project => {
  const [checklist, setChecklist] = useState();
  const [answers, setAnswers] = useState();
  const [submitting, setSubmitting] = useState(false);
  const dispatch = useDispatch();

  const {state, call} = useQuery(getData, [project]);
  useEffect(call, []);

  // Select first checklist when fetching is completed
  useEffect(() => {
    if (state.data) {
      setChecklist(state.data.questions[0]);
    }
  }, [state.data]);

  // Convert list to map
  useEffect(() => {
    const myAnswers = state.data ? state.data.answers : []
      .filter(answer => answer.checklist_uuid === checklist.uuid)
      .reduce((result, answer) => ({
        ...result,
        [answer.question_uuid]: answer.value,
      }), {});
    setAnswers(myAnswers);
  }, [checklist, state.data]);

  const submit = useCallback(async () => {
    setSubmitting(true);
    try {
      await post('/marketplace-checklist-answers/submit/', answers);
    } catch (error) {
      setSubmitting(false);
      const errorMessage = `${translate('Unable to submit answers.')} ${format(error)}`;
      dispatch(showError(errorMessage));
      return;
    }
    dispatch(showSuccess(translate('Answers have been submitted')));
    setSubmitting(false);
  }, [answers]);

  return {
    ...state,
    checklist,
    setChecklist,
    answers,
    setAnswers,
    submit,
    submitting,
  };
};
