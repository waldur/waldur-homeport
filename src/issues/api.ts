import { getAll, getList } from '@waldur/core/api';

interface IssueTemplateAttachment {
  name: string;
  field: string;
}

interface IssueTemplate {
  name: string;
  description: string;
  issue_type: string;
  attachments: IssueTemplateAttachment[];
}

export const getTemplates = () => getAll<IssueTemplate>('/support-templates/');

export const getIssues = params => getList('/support-issues/', params);
