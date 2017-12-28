export interface JiraIssueType {
  url: string;
  name: string;
  icon_url: string;
  subtask: boolean;
}

export interface JiraProject {
  url: string;
  issue_types: JiraIssueType[];
  project_uuid: string;
}

export interface Resource {
  url: string;
  name: string;
  resource_type: string;
}

export interface JiraIssue {
  url?: string;
  key?: string;
  project: JiraProject;
  parent?: JiraIssue;
  resource?: Resource;
  type: JiraIssueType;
  summary: string;
  description?: string;
}
