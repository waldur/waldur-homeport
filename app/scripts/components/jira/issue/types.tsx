export interface JiraIssueType {
  url: string;
  name: string;
  description: string;
  icon_url: string;
}

export interface JiraProject {
  url: string;
  issue_types: JiraIssueType[];
}

export interface FormData {
  type: JiraIssueType;
  summary: string;
  description?: string;
}

export interface IssueCreateRequest extends FormData {
  project: JiraProject;
}
