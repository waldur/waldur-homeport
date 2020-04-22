import { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { translate } from '@waldur/i18n';
import { showSuccess, showError } from '@waldur/store/coreSaga';

import {
  getChecklists,
  getQuestions,
  getAnswers,
  postAnswers,
  getStats,
} from './api';
import { Checklist, Answer, ChecklistStats } from './types';

const useChecklistSelector = (categoryId: string) => {
  const [checklistOptions, setChecklistOptions] = useState([]);
  const [checklistLoading, setChecklistLoading] = useState(true);
  const [checklistErred, setChecklistErred] = useState(false);
  const [checklist, setChecklist] = useState<Checklist>();

  const dispatch = useDispatch();

  useEffect(() => {
    async function load() {
      setChecklistLoading(true);
      setChecklistErred(false);
      try {
        const checklists = (await getChecklists(categoryId)).map(item => ({
          ...item,
          name: translate('{name} ({questions_count} questions)', item),
        }));
        setChecklistOptions(checklists);
        setChecklistLoading(false);
        // Select first checklist when fetching is completed
        setChecklist(checklists[0]);
      } catch (error) {
        setChecklistLoading(false);
        setChecklistErred(true);
        const errorMessage = `${translate(
          'Unable to load checklists.',
        )} ${format(error)}`;
        dispatch(showError(errorMessage));
        return;
      }
    }
    load();
  }, []);

  return {
    checklistLoading,
    checklistErred,
    checklistOptions,
    checklist,
    setChecklist,
  };
};

export const useProjectChecklist = (project, categoryId) => {
  const { checklist, ...checklistLoader } = useChecklistSelector(categoryId);

  const [questionsList, setQuestionsList] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questionsErred, setQuestionsErred] = useState(true);

  const [answers, setAnswers] = useState<{}>();
  const [submitting, setSubmitting] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    async function load() {
      setQuestionsLoading(true);
      setQuestionsErred(false);
      try {
        const questions = await getQuestions(checklist.uuid);
        const answersList = await getAnswers(checklist.uuid, project.uuid);
        setQuestionsList(questions);
        setAnswers(
          answersList.reduce(
            (result, answer: Answer) => ({
              ...result,
              [answer.question_uuid]: answer.value,
            }),
            {},
          ),
        );
        setQuestionsLoading(false);
      } catch (error) {
        setQuestionsLoading(false);
        setQuestionsErred(true);
        const errorMessage = `${translate(
          'Unable to load questions and answers.',
        )} ${format(error)}`;
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
      const payload = Object.keys(answers).map(question_uuid => ({
        question_uuid,
        value: answers[question_uuid],
      }));
      await postAnswers(checklist.uuid, project.uuid, payload);
    } catch (error) {
      setSubmitting(false);
      const errorMessage = `${translate('Unable to submit answers.')} ${format(
        error,
      )}`;
      dispatch(showError(errorMessage));
      return;
    }
    dispatch(showSuccess(translate('Answers have been submitted')));
    setSubmitting(false);
  }, [answers]);

  return {
    ...checklistLoader,
    checklist,
    questionsLoading,
    questionsErred,
    questionsList,
    answers,
    setAnswers,
    submit,
    submitting,
  };
};

export const useChecklistOverview = (categoryId: string) => {
  const { checklist, ...checklistLoader } = useChecklistSelector(categoryId);

  const [statsList, setStatsList] = useState<ChecklistStats[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsErred, setStatsErred] = useState(true);

  const dispatch = useDispatch();

  useEffect(() => {
    async function load() {
      setStatsLoading(true);
      setStatsErred(false);
      try {
        const stats = await getStats(checklist.uuid);
        setStatsList(stats);
        setStatsLoading(false);
      } catch (error) {
        setStatsLoading(false);
        setStatsErred(true);
        const errorMessage = `${translate(
          'Unable to load compliance overview.',
        )} ${format(error)}`;
        dispatch(showError(errorMessage));
        return;
      }
    }
    if (checklist) {
      load();
    }
  }, [checklist]);

  return {
    ...checklistLoader,
    checklist,
    statsList,
    statsLoading,
    statsErred,
  };
};
