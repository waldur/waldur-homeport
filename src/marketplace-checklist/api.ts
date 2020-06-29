import { getAll, getById, post } from '@waldur/core/api';

import { Category, Checklist, Question, Answer, ChecklistStats } from './types';

export const getCategories = () =>
  getAll<Category>('/marketplace-checklists-categories/');

export const getCategory = (category_uuid: string) =>
  getById<Category>('/marketplace-checklists-categories/', category_uuid);

export const getChecklists = (categoryId?: string) =>
  getAll<Checklist>(
    categoryId
      ? `/marketplace-checklists-categories/${categoryId}/checklists/`
      : '/marketplace-checklists/',
  );

export const getQuestions = (checklistId: string) =>
  getAll<Question>(`/marketplace-checklists/${checklistId}/questions/`);

export const getAnswers = (checklistId: string, projectId: string) =>
  getAll<Answer>(
    `/marketplace-checklists/${checklistId}/answers/${projectId}/`,
  );

export const postAnswers = (
  checklistId: string,
  projectId: string,
  answers: Answer[],
) =>
  post(
    `/marketplace-checklists/${checklistId}/answers/${projectId}/submit/`,
    answers,
  );

export const getStats = (checklistId: string) =>
  getAll<ChecklistStats>(`/marketplace-checklists/${checklistId}/stats/`);

export const getCustomerStats = (customerId: string, checklistId: string) =>
  getAll<ChecklistStats>(
    `/customers/${customerId}/marketplace-checklists/${checklistId}/`,
  );
