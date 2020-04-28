type QuestionType = 'boolean' | 'string' | 'enum' | 'secret';

export interface FieldProps {
  label: string;
  description?: string;
  variable: string;
  options?: string[];
  required?: boolean;
}

interface BaseQuestion extends FieldProps {
  type: QuestionType;
  default?: string | boolean;
  group?: string;
  showIf?: string | Record<string, string | boolean>;
}

export interface Question extends BaseQuestion {
  subquestions?: BaseQuestion[];
  showSubquestionIf?: boolean | string;
}

export interface TemplateVersion {
  readme: string;
  questions: Question[];
}

export interface Namespace {
  name: string;
  uuid: string;
}

export interface RancherProject {
  name: string;
  uuid: string;
  namespaces: Namespace[];
}

export interface Template {
  name: string;
  uuid: string;
  default_version: string;
  catalog_name: string;
  catalog_uuid: string;
  versions: string[];
}

export interface Cluster {
  name: string;
  uuid: string;
  marketplace_category_uuid: string;
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
