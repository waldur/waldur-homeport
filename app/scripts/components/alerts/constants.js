export const ALERT_TEMPLATES = {
  customer_has_zero_services: gettext('Organization {customer_name} has no providers.'),
  customer_has_zero_resources: gettext('Organization {customer_name} does not have any resources.'),
  customer_has_zero_projects: gettext('Organization {customer_name} does not have any projects.'),
  service_unavailable: gettext('Provider {service_name} is not responding.'),
  resource_disappeared_from_backend: gettext('Resource {resource_name} has disappeared from the {service_name} provider in {project_name} project.'),
  customer_projected_costs_exceeded: gettext('This month estimated costs for organization {customer_name} exceeded.'),
  customer_project_count_exceeded: gettext('Organization {customer_name} has exhausted quota {quota_name}.'),
  customer_resource_count_exceeded: gettext('Organization {customer_name} has exhausted quota {quota_name}.'),
  customer_service_count_exceeded: gettext('Organization {customer_name} has exhausted quota {quota_name}.'),
};

export const ALERT_ICONS_TYPES = {
  customers: gettext('Alerts about organization'),
  resources: gettext('Alerts about resources (VMs and applications)'),
  providers: gettext('Alerts about providers')
};

export const ALERT_ICONS = {
  customer_has_zero_services: 'customer',
  customer_has_zero_resources: 'customer',
  customer_has_zero_projects: 'customer',
  service_has_unmanaged_resources: 'service',
  service_unavailable: 'service',
  resource_disappeared_from_backend: 'resource',
  customer_projected_costs_exceeded: 'customer',
  customer_project_count_exceeded: 'customer',
  customer_resource_count_exceeded: 'customer',
  customer_service_count_exceeded: 'customer',
  quota_usage_is_over_threshold: 'customer',
};
