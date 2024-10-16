import { ReactNode } from 'react';

import { Customer, Project } from '@waldur/workspace/types';

export interface IssueOptions {
  title: string;
  hideTitle: boolean;
  descriptionLabel: string;
  descriptionPlaceholder: string;
  summaryLabel: string;
  summaryPlaceholder: string;
  submitTitle: string;
}

export interface CreateIssueProps {
  type: string;
  additionalDetails?: string;
  customer?: Customer;
  project?: Project;
  resource?: any;
  summary?: string;
  description?: string;
  options: Partial<IssueOptions>;
}

export interface IssueFormData {
  type: any;
  summary: string;
  description: string;
  template: any;
  files: FileList;
  issueTemplate?: any;
  project?: Project;
  resource?: any;
}

export interface IssueRequestPayload {
  type: string;
  summary: string;
  description: string;
  is_reported_manually?: boolean;
  customer?: string;
  project?: string;
  resource?: string;
  template?: string;
  caller?: string;
  assignee?: string;
  priority?: string;
}

export interface IssueResponse {
  url: string;
  key: string;
  uuid: string;
}

export interface IssueTypeOption {
  iconNode: ReactNode;
  label: string;
  description: string;
  id: string;
}
