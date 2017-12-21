export interface JiraIssueType {
  url: string;
  name: string;
  description: string;
  icon_url: string;
}

export interface JiraProject {
  issue_types: JiraIssueType[];
}
