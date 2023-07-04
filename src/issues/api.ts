import { getAll } from '@waldur/core/api';

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
