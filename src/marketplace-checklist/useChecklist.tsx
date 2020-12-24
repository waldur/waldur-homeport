import { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { translate } from '@waldur/i18n';
import { showSuccess, showError } from '@waldur/store/notify';

import {
  getChecklists,
  getQuestions,
  getAnswers,
  postAnswers,
  getStats,
  getCategory,
} from './api';
import { Checklist, Answer, ChecklistStats, Question } from './types';

const useChecklistSelector = (categoryId?: string) => {
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
        const checklists = (await getChecklists(categoryId)).map((item) => ({
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

type AnswersTableType = Record<string, boolean>;

const mapArrayToObject = (data: Answer[]): AnswersTableType =>
  data.reduce(
    (result: {}, answer: Answer) => ({
      ...result,
      [answer.question_uuid]: answer.value,
    }),
    {},
  );

export const useUserChecklist = (userId, categoryId?) => {
  const { checklist, ...checklistLoader } = useChecklistSelector(categoryId);

  const [questionsList, setQuestionsList] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questionsErred, setQuestionsErred] = useState(true);
  const [categoryInfo, setCategoryInfo] = useState(null);

  const [answers, setAnswers] = useState<AnswersTableType>();
  const [answersTable, setAnswersTable] = useState<AnswersTableType>();
  const [submitting, setSubmitting] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    async function load() {
      setQuestionsLoading(true);
      setQuestionsErred(false);
      try {
        const questions = await getQuestions(checklist.uuid);
        const answersList = await getAnswers(userId, checklist.uuid);
        if (categoryId) {
          const category = await getCategory(categoryId);
          setCategoryInfo(category);
        }

        setQuestionsList(questions);

        setAnswers(mapArrayToObject(answersList));
        setAnswersTable(mapArrayToObject(answersList));

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
      const payload = Object.keys(answersTable).map((question_uuid) => ({
        question_uuid,
        value: answersTable[question_uuid],
      }));
      await postAnswers(checklist.uuid, payload);
      setAnswers(answersTable);
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
  }, [answersTable]);

  return {
    ...checklistLoader,
    checklist,
    questionsLoading,
    questionsErred,
    questionsList,
    categoryInfo,
    answers,
    setAnswers,
    answersTable,
    setAnswersTable,
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
