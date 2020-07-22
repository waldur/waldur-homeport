export interface Namespace {
  name: string;
  uuid: string;
}

export interface RancherProject {
  name: string;
  uuid: string;
  namespaces: Namespace[];
}

type QuestionType = 'boolean' | 'string' | 'enum' | 'secret';

export interface FieldProps {
  label: string;
  description?: string;
  variable: string;
  required?: boolean;
  validate?: any;
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

export interface Secret {
  name: string;
  id: string;
}

export interface Catalog {
  icon?: string;
  uuid: string;
  name: string;
  description: string;
}

export interface KubeconfigFile {
  config: string;
}

export interface HPA {
  uuid: string;
  name: string;
  project_name: string;
  description: string;
  namespace_name: string;
  workload_name: string;
  min_replicas: number;
  max_replicas: number;
  current_replicas: number;
  desired_replicas: number;
  created: string;
  runtime_state: string;
  metrics: Metric[];
}

interface Metric {
  name: string;
  type: string;
  target: any;
}

export interface HPACreateType {
  name: string;
  description?: string;
  workload: string;
  min_replicas: number;
  max_replicas: number;
  metrics: Metric[];
}

interface ClusterTemplateNode {
  min_vcpu: number;
  min_ram: number;
  system_volume_size: number;
  preferred_volume_type: string;
  roles: string[];
}

export interface ClusterTemplate {
  uuid: string;
  name: string;
  description: string;
  created: string;
  modified: string;
  nodes: ClusterTemplateNode[];
}

export type NodeRole = 'worker' | 'etcd' | 'controlplane';
