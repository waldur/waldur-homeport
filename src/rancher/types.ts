import { OpenStackFlavor } from 'waldur-js-client';
export {
  RancherTemplateQuestion as Question,
  RancherTemplateQuestionType as QuestionType,
} from 'waldur-js-client';

export interface Namespace {
  url: string;
  name: string;
  uuid: string;
}

export interface RancherProject {
  url: string;
  name: string;
  uuid: string;
  namespaces: Namespace[];
}

export interface FieldProps {
  label: string;
  description?: string;
  variable: string;
  required?: boolean;
  validate?: any;
}

export type NodeRole = 'agent' | 'server';

export interface NodeField {
  flavor: OpenStackFlavor;
  name: string;
  roles: string[];
  units: number;
}
