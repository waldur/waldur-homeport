import { OfferingTemplate } from 'waldur-js-client';

import { AgentRoleField } from '@/marketplace/offerings/update/integration/agentConfiguration';

interface TemplateOrganisation {
  uuid: string;
  url: string;
  name: string;
}

export interface CreateFromTemplateFormData {
  template?: OfferingTemplate;
  organisation?: TemplateOrganisation;
  name?: string;
  category?: { uuid: string; url: string; title: string };
  // Keyed by parameter key: the wizard's own field names, so a parameter
  // named like a form field cannot clash with it.
  parameters: Record<string, unknown>;
  // A backend per role; blank turns the role off.
  agent_roles: Partial<Record<AgentRoleField, string>>;
  // Backends of the site's own the roles name, outside the plugin catalogue.
  custom_backends: string[];
  // Keyed by setting name: the required settings the chosen backends need
  // that the template does not set.
  backend_settings: Record<string, unknown>;
}
