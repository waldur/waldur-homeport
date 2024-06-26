import { Project } from '@waldur/workspace/types';

export interface ProjectCounterResourceItem {
  label: string;
  value: number | string;
}

export interface OecdCode {
  label: string;
  value: string;
}

export interface EditProjectProps {
  project: Project;
  name: string;
}
