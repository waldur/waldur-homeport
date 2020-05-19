import { AsyncState } from 'react-use/lib/useAsync';

import { Customer, Project } from '@waldur/workspace/types';

import { IssueTemplate, IssueTemplateAttachment } from '../api';

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
  options: Partial<IssueOptions>;
}

export interface OwnProps {
  issue: CreateIssueProps;
  issueTypes: any;
  options: IssueOptions;
  onCreateIssue(formData: IssueFormData): void;
  templateState: AsyncState<IssueTemplate[]>;
  filteredTemplates: IssueTemplate[];
  attachments: IssueTemplateAttachment[];
}

export interface IssueFormData {
  type: any;
  summary: string;
  description: string;
  template: any;
  files: FileList;
  issueTemplate?: any;
}

export interface IssueRequestPayload {
  type: string;
  summary: string;
  description: string;
  is_reported_manually: boolean;
  customer?: string;
  project?: string;
  resource?: string;
  template?: string;
}

export interface IssueResponse {
  url: string;
  key: string;
  uuid: string;
}

export interface CreateIssueDialogProps {
  resolve: {
    issue: CreateIssueProps;
    options: IssueOptions;
  };
}

export interface IssueTypeOption {
  iconClass: string;
  textClass: string;
  label: string;
  description: string;
  id: string;
}
