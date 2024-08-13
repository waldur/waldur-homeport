import { Project } from '@waldur/workspace/types';

export interface ProjectCounterResourceItem {
  label: string;
  value: number | string;
}

export interface EditProjectProps {
  project: Project;
  name: string;
}
