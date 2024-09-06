export const resourcesListRequiredFields = () => [
  'uuid',
  'name',
  'attributes', // Expandable view
  'available_actions', // CreateLexisLinkAction
  'end_date', // EditResourceEndDateAction
  'offering_type', // Expandable view, Actions
  'offering_customer_uuid', // SubmitReportAction, EditResourceEndDateAction
  'backend_metadata', // Mass-actions
  'backend_id', // SetBackendIdAction
  'slug', // SetSlugAction
  'scope', // Expandable view, Actions
  'report', // ShowReportAction, SubmitReportAction
  'plan_uuid', // Expandable view, ChangeLimitsAction
  'marketplace_plan_uuid', // ChangeLimitsAction
  'is_limit_based', // Expandable view, ChangeLimitsAction
  'is_usage_based', // Expandable view
  'limits', // Expandable view
  'limit_usage', // Expandable view
  'current_usages', // Expandable view
  'parent_uuid', // Expandable view
  'parent_name', // Expandable view
  'customer_uuid', // SetBackendIdAction
  'description', // EditAction
  'resource_type', // EditAction, TerminateAction, UnlinkActionItem, Mass-actions
  'resource_uuid', // Mass-actions
];
