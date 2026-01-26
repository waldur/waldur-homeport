import type {
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
  verify_ssl: boolean;
  credentialsValid: boolean;

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
