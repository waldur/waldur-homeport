import { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { getAll, post } from '@waldur/core/api';
import { format } from '@waldur/core/ErrorMessageFormatter';
import { translate } from '@waldur/i18n';
import { showSuccess, showError } from '@waldur/store/coreSaga';

interface Answer {
  question_uuid: string;
  value: boolean;
}

export const useChecklist = project => {
  const [checklistOptions, setChecklistOptions] = useState([]);
  const [checklistLoading, setChecklistLoading] = useState(true);
  const [checklistErred, setChecklistErred] = useState(false);

  const [questionsList, setQuestionsList] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questionsErred, setQuestionsErred] = useState(true);

  const [checklist, setChecklist] = useState();
  const [answers, setAnswers] = useState();
  const [submitting, setSubmitting] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    async function load() {
      setChecklistLoading(true);
      setChecklistErred(false);
      try {
        const checklists = await getAll('/marketplace-checklists/');
        setChecklistOptions(checklists);
        setChecklistLoading(false);
        // Select first checklist when fetching is completed
        setChecklist(checklists[0]);
      } catch (error) {
        setChecklistLoading(false);
        setChecklistErred(true);
        const errorMessage = `${translate('Unable to load checklists.')} ${format(error)}`;
        dispatch(showError(errorMessage));
        return;
      }
    }
    load();
  }, []);

  useEffect(() => {
    async function load() {
      setQuestionsLoading(true);
      setQuestionsErred(false);
      try {
        const questions = await getAll(`/marketplace-checklists/${checklist.uuid}/questions/`);
        const answersList = await getAll<Answer>(`/marketplace-checklists/${checklist.uuid}/answers/${project.uuid}/`);
        setQuestionsList(questions);
        setAnswers(answersList.reduce((result, answer) => ({
          ...result,
          [answer.question_uuid]: answer.value,
        }), {}));
        setQuestionsLoading(false);
      } catch (error) {
        setQuestionsLoading(false);
        setQuestionsErred(true);
        const errorMessage = `${translate('Unable to load questions and answers.')} ${format(error)}`;
        dispatch(showError(errorMessage));
        return;
      }
    }
    if (checklist) {
      load();
    }
  }, [checklist]);

  const submit = useCallback(async () => {
    setSubmitting(true);
    try {
      // tslint:disable-next-line: variable-name
      const payload = Object.keys(answers).map(question_uuid => ({
        question_uuid,
        value: answers[question_uuid],
      }));
      await post(`/marketplace-checklists/${checklist.uuid}/answers/${project.uuid}/submit/`, payload);
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
    checklistLoading,
    checklistErred,
    checklistOptions,
    questionsLoading,
    questionsErred,
    questionsList,
    checklist,
    setChecklist,
    answers,
    setAnswers,
    submit,
    submitting,
  };
};
