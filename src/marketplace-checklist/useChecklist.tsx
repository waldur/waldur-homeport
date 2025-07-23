import { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
  AnswerSubmitRequest,
  ChecklistCategory,
  marketplaceChecklistsAnswersSubmitCreate,
  marketplaceChecklistsCategoriesRetrieve,
  marketplaceChecklistsQuestionsList,
  marketplaceChecklistsStatsList,
  marketplaceChecklistsUserAnswersList,
} from 'waldur-js-client';

import { getAllPages } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

import { Checklist, Answer, ChecklistStats, Question } from './types';
import { getChecklists } from './utils';

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
        dispatch(
          showErrorResponse(error, translate('Unable to load checklists.')),
        );
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
  const [categoryInfo, setCategoryInfo] = useState<ChecklistCategory>(null);

  const [answers, setAnswers] = useState<AnswersTableType>();
  const [answersTable, setAnswersTable] = useState<AnswersTableType>();
  const [submitting, setSubmitting] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    async function load() {
      setQuestionsLoading(true);
      setQuestionsErred(false);
      try {
        const questions = await getAllPages((page) =>
          marketplaceChecklistsQuestionsList({
            path: { uuid: checklist.uuid },
            query: { page },
          }),
        );
        const answersList = await getAllPages((page) =>
          marketplaceChecklistsUserAnswersList({
            path: {
              checklist_uuid: checklist.uuid,
              user_uuid: userId,
            },
            query: { page },
          }),
        );
        if (categoryId) {
          const category = await marketplaceChecklistsCategoriesRetrieve({
            path: { uuid: categoryId },
          });
          setCategoryInfo(category.data);
        }

        setQuestionsList(questions);

        setAnswers(mapArrayToObject(answersList));
        setAnswersTable(mapArrayToObject(answersList));

        setQuestionsLoading(false);
      } catch (error) {
        setQuestionsLoading(false);
        setQuestionsErred(true);
        dispatch(
          showErrorResponse(
            error,
            translate('Unable to load questions and answers.'),
          ),
        );
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
      const payload: AnswerSubmitRequest[] = Object.keys(answersTable).map(
        (question_uuid) => ({
          question_uuid,
          answer_data: answersTable[question_uuid],
        }),
      );
      await marketplaceChecklistsAnswersSubmitCreate({
        path: { checklist_uuid: checklist.uuid },
        body: payload,
      });
      setAnswers(answersTable);
    } catch (error) {
      setSubmitting(false);
      dispatch(
        showErrorResponse(error, translate('Unable to submit answers.')),
      );
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
        const stats = await marketplaceChecklistsStatsList({
          path: { checklist_uuid: checklist.uuid },
        }).then((r) => r.data);
        setStatsList(stats);
        setStatsLoading(false);
      } catch (error) {
        setStatsLoading(false);
        setStatsErred(true);
        dispatch(
          showErrorResponse(
            error,
            translate('Unable to load compliance overview.'),
          ),
        );
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
