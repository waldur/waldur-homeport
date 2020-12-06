import { GeolocationPoint } from '@waldur/map/types';

export interface Category {
  name: string;
  uuid: string;
  checklists_count: number;
  icon: string;
}

export interface Question {
  uuid: string;
  correct_answer: boolean;
  description: string;
  solution: string;
  category_uuid: string;
}

export interface Checklist {
  name: string;
  description: string;
  uuid: string;
  questions_count: number;
  category_name: string;
  category_uuid: string;
  project_roles?: string[];
  customer_roles?: string[];
}

export interface Answer {
  question_uuid: string;
  value: boolean;
}

export type Answers = Record<string, boolean>;

export interface ChecklistStats extends GeolocationPoint {
  uuid: string;
  name: string;
  score: number;
}

export interface ProjectStats {
  uuid: string;
  name: string;
  score: number;
  positive_count: number;
  negative_count: number;
  unknown_count: number;
}
