import type {
  AtlassianProjectResponse,
  AtlassianRequestTypeResponse,
  AtlassianCustomFieldResponse,
  AtlassianPriorityResponse,
  AuthMethodEnum,
} from 'waldur-js-client';

export interface AtlassianCredentials {
  api_url: string;
  auth_method: AuthMethodEnum;
  email?: string;
  token?: string;
  personal_access_token?: string;
  username?: string;
  password?: string;
  verify_ssl?: boolean;
}

export interface DiscoveryState {
  credentials: AtlassianCredentials | null;
  credentialsValid: boolean;
  projects: AtlassianProjectResponse[];
  selectedProject: AtlassianProjectResponse | null;
  requestTypes: AtlassianRequestTypeResponse[];
  selectedRequestTypes: AtlassianRequestTypeResponse[];
  customFields: AtlassianCustomFieldResponse[];
  priorities: AtlassianPriorityResponse[];
  fieldMappings: {
    reporter_field?: string;
    impact_field?: string;
    organisation_field?: string;
    project_field?: string;
    affected_resource_field?: string;
    caller_field?: string;
    template_field?: string;
    waldur_backend_id_field?: string;
    default_priority?: string;
  };
}
