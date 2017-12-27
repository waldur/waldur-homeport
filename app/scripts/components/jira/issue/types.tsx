export interface JiraIssueType {
  url: string;
  name: string;
  icon_url: string;
  subtask: boolean;
}

export interface JiraProject {
  url: string;
  issue_types: JiraIssueType[];
}

export interface JiraIssue {
  url?: string;
  key?: string;
  project: JiraProject;
  parent?: JiraIssue;
  type: JiraIssueType;
  summary: string;
  description?: string;
}
