import type {
  AtlassianCredentialsRequest,
  AtlassianProjectResponse,
  AtlassianRequestTypeResponse,
  AtlassianCustomFieldResponse,
  AtlassianPriorityResponse,
  AuthMethodEnum,
} from 'waldur-js-client';

interface FieldMappings {
  reporter_field?: string;
  impact_field?: string;
  organisation_field?: string;
  project_field?: string;
  affected_resource_field?: string;
  caller_field?: string;
  template_field?: string;
  waldur_backend_id_field?: string;
  default_priority?: string;
  default_offering_issue_type?: string;
}

/**
 * Form values for Atlassian Discovery wizard.
 * All wizard state is stored in Final Form values.
 */
export interface AtlassianFormValues {
  // Step 1: Credentials
  api_url: string;
  auth_method: AuthMethodEnum;
  email: string;
  token: string;
  personal_access_token: string;
  username: string;
  password: string;
  client_id: string;
  client_secret: string;
  verify_ssl: boolean;
  credentialsValid: boolean;
  // URL the backend connects to: for OAuth 2.0 a Cloud site URL becomes the
  // API gateway URL.
  resolvedApiUrl?: string;

  // Step 2: Projects (populated by ProjectStep)
  projects: AtlassianProjectResponse[];
  selectedProjectId: string | null;

  // Step 3: Request Types (populated by RequestTypesStep)
  requestTypes: AtlassianRequestTypeResponse[];
  selectedRequestTypeIds: string[];

  // Step 4: Field Mappings (populated by FieldMappingStep)
  customFields: AtlassianCustomFieldResponse[];
  priorities: AtlassianPriorityResponse[];
  fieldMappings: FieldMappings;
}

/**
 * Extract credentials from form values for API calls.
 */
export const extractCredentials = (
  values: AtlassianFormValues,
): AtlassianCredentialsRequest => ({
  api_url: values.api_url,
  auth_method: values.auth_method,
  email: values.email,
  token: values.token,
  personal_access_token: values.personal_access_token,
  username: values.username,
  password: values.password,
  client_id: values.client_id,
  client_secret: values.client_secret,
  verify_ssl: values.verify_ssl,
});
