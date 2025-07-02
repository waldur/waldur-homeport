// WARNING: This file is auto-generated from src/waldur_core/core/management/commands/print_features_enums.py
// Do not edit it manually. All manual changes would be overridden.

export enum CustomerFeatures {
  payments_for_staff_only = 'customer.payments_for_staff_only',
  show_domain = 'customer.show_domain',
  show_permission_reviews = 'customer.show_permission_reviews',
}

export enum DeploymentFeatures {
  enable_cookie_notice = 'deployment.enable_cookie_notice',
  send_metrics = 'deployment.send_metrics',
}

export enum InvitationsFeatures {
  civil_number_required = 'invitations.civil_number_required',
  conceal_civil_number = 'invitations.conceal_civil_number',
  show_service_accounts = 'invitations.show_service_accounts',
}

export enum MarketplaceFeatures {
  call_only = 'marketplace.call_only',
  catalogue_only = 'marketplace.catalogue_only',
  conceal_prices = 'marketplace.conceal_prices',
  import_resources = 'marketplace.import_resources',
  lexis_links = 'marketplace.lexis_links',
  show_call_management_functionality = 'marketplace.show_call_management_functionality',
  show_experimental_ui_components = 'marketplace.show_experimental_ui_components',
  show_resource_end_date = 'marketplace.show_resource_end_date',
}

export enum OpenstackFeatures {
  hide_volume_type_selector = 'openstack.hide_volume_type_selector',
  show_migrations = 'openstack.show_migrations',
}

export enum ProjectFeatures {
  estimated_cost = 'project.estimated_cost',
  mandatory_end_date = 'project.mandatory_end_date',
  mandatory_start_date = 'project.mandatory_start_date',
  oecd_fos_2007_code = 'project.oecd_fos_2007_code',
  show_credit_in_create_dialog = 'project.show_credit_in_create_dialog',
  show_description_in_create_dialog = 'project.show_description_in_create_dialog',
  show_end_date_in_create_dialog = 'project.show_end_date_in_create_dialog',
  show_image_in_create_dialog = 'project.show_image_in_create_dialog',
  show_industry_flag = 'project.show_industry_flag',
  show_start_date_in_create_dialog = 'project.show_start_date_in_create_dialog',
  show_type_in_create_dialog = 'project.show_type_in_create_dialog',
}

export enum RancherFeatures {
  apps = 'rancher.apps',
  volume_mount_point = 'rancher.volume_mount_point',
}

export enum SlurmFeatures {
  jobs = 'slurm.jobs',
}

export enum SupportFeatures {
  conceal_change_request = 'support.conceal_change_request',
  pricelist = 'support.pricelist',
  vm_type_overview = 'support.vm_type_overview',
}

export enum UserFeatures {
  disable_user_termination = 'user.disable_user_termination',
  notifications = 'user.notifications',
  preferred_language = 'user.preferred_language',
  show_slug = 'user.show_slug',
  show_username = 'user.show_username',
  ssh_keys = 'user.ssh_keys',
}

export type FeaturesEnum =
  | CustomerFeatures
  | DeploymentFeatures
  | InvitationsFeatures
  | MarketplaceFeatures
  | OpenstackFeatures
  | ProjectFeatures
  | RancherFeatures
  | SlurmFeatures
  | SupportFeatures
  | UserFeatures
;
