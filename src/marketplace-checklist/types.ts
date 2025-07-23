export {
  Question,
  Checklist,
  ChecklistCustomerStats as ChecklistStats,
} from 'waldur-js-client';

export interface Category {
  name: string;
  uuid: string;
  checklists_count: number;
  icon: string;
}

export interface ChecklistSelectorOption {
  name: string;
  uuid: string;
}

export interface Answer {
  question_uuid: string;
  value?: boolean;
}

export type Answers = Record<string, boolean>;
