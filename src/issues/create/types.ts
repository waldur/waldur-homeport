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
  /** Offering UUID — set when a request is opened from an offering, so the
   * backend can route it to that offering's provider helpdesk. */
  offering?: string;
}

export interface IssueTypeOption {
  iconNode: ReactNode;
  label: string;
  description: string;
  id: string;
}
