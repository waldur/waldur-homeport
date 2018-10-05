export interface JiraIssueType {
  url: string;
  name: string;
  icon_url: string;
  subtask: boolean;
}

export interface IssuePriority {
  url: string;
  name: string;
  icon_url: string;
  description: string;
}

export interface JiraProject {
  url: string;
  issue_types: JiraIssueType[];
  priorities: IssuePriority[];
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
  priority: IssuePriority;
  parent?: JiraIssue;
  resource?: Resource;
  type: JiraIssueType;
  summary: string;
  description?: string;
  first_response_sla?: string;
}
