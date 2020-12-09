import { Checklist, ChecklistStats, Question, Answer, Category } from './types';

export const initCustomer = (props = {}): ChecklistStats => {
  return {
    uuid: '1',
    name: 'Alex',
    score: 0,
    latitude: 49.601984,
    longitude: 95.63666172955419,
    ...props,
  };
};

export const checklists: Checklist[] = [
  {
    uuid: '51525237e3bc40879c437f5d4d3be850',
    name: 'Best practices (2 questions)',
    description: '',
    questions_count: 2,
    category_name: 'Project checklist',
    category_uuid: '7fd33c0055d8453d84e4da5371dd8fab',
  },
  {
    uuid: '407296c2821345aab0f02a583293a476',
    name: 'Cyberhygiene (2 questions)',
    description: '',
    questions_count: 2,
    category_name: 'Project checklist',
    category_uuid: '7fd33c0055d8453d84e4da5371dd8fab',
  },
];

export const questions: Question[] = [
  {
    uuid: '554b3673d2f944299057143fa62be3ef',
    description: 'I assign PIDs to all my generated resources',
    solution: 'Please see RDA recommendations here and here',
    category_uuid: '6dfcdbe3c18241dc87526ef411bf6064',
    correct_answer: true,
  },
  {
    uuid: '4472d7df987644f39804cb7dbdbc2e6e',
    description: 'I preserve data in a storage with SLAs on preservation',
    solution: 'Find a service provider to use for keeping artifacts.',
    category_uuid: '6dfcdbe3c18241dc87526ef411bf6064',
    correct_answer: true,
  },
];

export const answers: Answer[] = [
  {
    question_uuid: '554b3673d2f944299057143fa62be3ef',
    value: false,
  },
  {
    question_uuid: '4472d7df987644f39804cb7dbdbc2e6e',
    value: true,
  },
];

export const category: Category = {
  uuid: '7fd33c0055d8453d84e4da5371dd8fab',
  icon: null,
  name: 'Project checklist',
  checklists_count: 2,
};
