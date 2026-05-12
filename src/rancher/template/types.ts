import { Question as BaseQuestion, Namespace, RancherProject } from '../types';

export interface Question extends Omit<
  BaseQuestion,
  'showIf' | 'subquestions' | 'showSubquestionIf'
> {
  showIf?: string | Record<string, string | boolean>;
  subquestions?: Question[];
  showSubquestionIf?: boolean | string;
}

export interface FormData {
  name: string;
  description: string;
  version: string;
  useNewNamespace: boolean;
  newNamespace?: string;
  namespace: Namespace;
  project: RancherProject;
  answers: object;
}
