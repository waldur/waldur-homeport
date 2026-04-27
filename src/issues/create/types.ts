import { ReactNode } from 'react';
import { Project } from 'waldur-js-client';

import { Customer } from '@/workspace/types';

export interface IssueFormData {
  type: any;
  summary: string;
  description: string;
  template: any;
  files: FileList;
  issueTemplate?: any;
  customer?: Customer;
  project?: Project;
  resource?: any;
}

export interface IssueTypeOption {
  iconNode: ReactNode;
  label: string;
  description: string;
  id: string;
}
