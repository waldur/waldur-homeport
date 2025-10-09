import { Project, ProjectCredit } from 'waldur-js-client';

export interface EditProjectProps {
  project: Project;
  name: string;
  disabled?: boolean;
}

export interface EditProjectCreditProps {
  credit: ProjectCredit;
  name: string;
}
