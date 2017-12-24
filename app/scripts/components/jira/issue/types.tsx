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

export interface JiraIssue {
  project: JiraProject;
  type: JiraIssueType;
  summary: string;
  description?: string;
}
