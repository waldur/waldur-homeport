import { getAll } from '@waldur/core/api';

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
