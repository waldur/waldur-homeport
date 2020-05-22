import { getAll, getList } from '@waldur/core/api';

import { Issue } from './list/types';

export interface IssueTemplateAttachment {
  name: string;
  field: string;
}

export interface IssueTemplate {
  name: string;
  description: string;
  issue_type: string;
  attachments: IssueTemplateAttachment[];
}

export const getTemplates = () => getAll<IssueTemplate>('/support-templates/');

export const getIssues = params => getList<Issue>('/support-issues/', params);
