import { GeolocationPoint } from '@waldur/marketplace/types';

export interface Category {
  name: string;
  uuid: string;
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
