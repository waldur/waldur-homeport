// WARNING: This file is auto-generated from src/waldur_core/core/management/commands/print_features_enums.py
// Do not edit it manually. All manual changes would be overridden.

export enum CustomerFeatures {
  payments_for_staff_only = 'customer.payments_for_staff_only',
  show_banking_data = 'customer.show_banking_data',
  show_domain = 'customer.show_domain',
  show_onboarding = 'customer.show_onboarding',
  show_permission_reviews = 'customer.show_permission_reviews',
  show_project_digest = 'customer.show_project_digest',
}

export enum DashboardFeatures {
  policy_matrix = 'dashboard.policy_matrix',
  spend_breakdown = 'dashboard.spend_breakdown',
  spend_forecast = 'dashboard.spend_forecast',
  usage_gauges = 'dashboard.usage_gauges',
  usage_limit_horizon = 'dashboard.usage_limit_horizon',
  usage_per_offering_bars = 'dashboard.usage_per_offering_bars',
  usage_period_over_period = 'dashboard.usage_period_over_period',
  usage_timeline = 'dashboard.usage_timeline',
  usage_treemap = 'dashboard.usage_treemap',
}

export enum DeploymentFeatures {
  enable_cookie_notice = 'deployment.enable_cookie_notice',
  enable_disclaimer_area = 'deployment.enable_disclaimer_area',
  send_metrics = 'deployment.send_metrics',
}

export enum InvitationsFeatures {
  civil_number_required = 'invitations.civil_number_required',
  conceal_civil_number = 'invitations.conceal_civil_number',
  show_course_accounts = 'invitations.show_course_accounts',
  show_service_accounts = 'invitations.show_service_accounts',
}

export enum MarketplaceFeatures {
  allow_display_of_images_in_markdown = 'marketplace.allow_display_of_images_in_markdown',
  call_only = 'marketplace.call_only',
  catalogue_only = 'marketplace.catalogue_only',
  conceal_audit_log_from_end_users = 'marketplace.conceal_audit_log_from_end_users',
  conceal_offering_pricing_tab_in_public_view = 'marketplace.conceal_offering_pricing_tab_in_public_view',
  conceal_pending_consumer_orders = 'marketplace.conceal_pending_consumer_orders',
  conceal_pending_provider_orders = 'marketplace.conceal_pending_provider_orders',
  conceal_prices = 'marketplace.conceal_prices',
  conceal_resource_metadata = 'marketplace.conceal_resource_metadata',
  display_offering_partitions = 'marketplace.display_offering_partitions',
  display_software_catalog = 'marketplace.display_software_catalog',
  display_user_tos = 'marketplace.display_user_tos',
  hide_marketplace_from_end_users = 'marketplace.hide_marketplace_from_end_users',
  hide_organization_information_from_project_members = 'marketplace.hide_organization_information_from_project_members',
  import_resources = 'marketplace.import_resources',
  lexis_links = 'marketplace.lexis_links',
  realtime_updates = 'marketplace.realtime_updates',
  show_call_management_functionality = 'marketplace.show_call_management_functionality',
  show_experimental_ui_components = 'marketplace.show_experimental_ui_components',
  show_openstack_duplicate_offerings = 'marketplace.show_openstack_duplicate_offerings',
  show_posix_id_pools = 'marketplace.show_posix_id_pools',
  show_resource_end_date = 'marketplace.show_resource_end_date',
}

export enum OpenstackFeatures {
  hide_volume_type_selector = 'openstack.hide_volume_type_selector',
  show_migrations = 'openstack.show_migrations',
}

export enum ProjectFeatures {
  estimated_cost = 'project.estimated_cost',
  mandatory_start_date = 'project.mandatory_start_date',
  oecd_fos_2007_code = 'project.oecd_fos_2007_code',
  science_domain = 'project.science_domain',
  show_credit_in_create_dialog = 'project.show_credit_in_create_dialog',
  show_description_in_create_dialog = 'project.show_description_in_create_dialog',
  show_end_date_in_create_dialog = 'project.show_end_date_in_create_dialog',
  show_image_in_create_dialog = 'project.show_image_in_create_dialog',
  show_industry_flag = 'project.show_industry_flag',
  show_kind_in_create_dialog = 'project.show_kind_in_create_dialog',
  show_matrix_chat = 'project.show_matrix_chat',
  show_permission_reviews = 'project.show_permission_reviews',
  show_start_date_in_create_dialog = 'project.show_start_date_in_create_dialog',
  show_type_in_create_dialog = 'project.show_type_in_create_dialog',
}

export enum RancherFeatures {
  apps = 'rancher.apps',
  volume_mount_point = 'rancher.volume_mount_point',
}

export enum ResellerFeatures {
  affiliates = 'reseller.affiliates',
  arrow = 'reseller.arrow',
}

export enum SupportFeatures {
  conceal_change_request = 'support.conceal_change_request',
  enable_llm_assistant = 'support.enable_llm_assistant',
  pricelist = 'support.pricelist',
  vm_type_overview = 'support.vm_type_overview',
}

export enum UserFeatures {
  conceal_api_token = 'user.conceal_api_token',
  conceal_permission_requests = 'user.conceal_permission_requests',
  conceal_remote_accounts = 'user.conceal_remote_accounts',
  disable_user_termination = 'user.disable_user_termination',
  notifications = 'user.notifications',
  pending_user_actions = 'user.pending_user_actions',
  preferred_language = 'user.preferred_language',
  show_data_access = 'user.show_data_access',
  show_identity_bridge = 'user.show_identity_bridge',
  show_slug = 'user.show_slug',
  show_username = 'user.show_username',
  ssh_keys = 'user.ssh_keys',
}

export type FeaturesEnum =
  | CustomerFeatures
  | DashboardFeatures
  | DeploymentFeatures
  | InvitationsFeatures
  | MarketplaceFeatures
  | OpenstackFeatures
  | ProjectFeatures
  | RancherFeatures
  | ResellerFeatures
  | SupportFeatures
  | UserFeatures
;
