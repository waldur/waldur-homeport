// WARNING: This file is auto-generated from src/waldur_core/core/management/commands/print_features_enums.py
// Do not edit it manually. All manual changes would be overridden.

export enum CustomerFeatures {
  payments_for_staff_only = 'customer.payments_for_staff_only',
  show_domain = 'customer.show_domain',
}

export enum InvitationsFeatures {
  civil_number_required = 'invitations.civil_number_required',
  conceal_civil_number = 'invitations.conceal_civil_number',
  require_user_details = 'invitations.require_user_details',
  show_tax_number = 'invitations.show_tax_number',
  tax_number_required = 'invitations.tax_number_required',
}

export enum MarketplaceFeatures {
  conceal_prices = 'marketplace.conceal_prices',
  import_resources = 'marketplace.import_resources',
  lexis_links = 'marketplace.lexis_links',
  show_call_management_functionality = 'marketplace.show_call_management_functionality',
  show_experimental_ui_components = 'marketplace.show_experimental_ui_components',
}

export enum OpenstackFeatures {
  hide_volume_type_selector = 'openstack.hide_volume_type_selector',
}

export enum ProjectFeatures {
  estimated_cost = 'project.estimated_cost',
  oecd_fos_2007_code = 'project.oecd_fos_2007_code',
  show_description_in_create_dialog = 'project.show_description_in_create_dialog',
  show_end_date_in_create_dialog = 'project.show_end_date_in_create_dialog',
  show_image_in_create_dialog = 'project.show_image_in_create_dialog',
  show_industry_flag = 'project.show_industry_flag',
  show_type_in_create_dialog = 'project.show_type_in_create_dialog',
}

export enum RancherFeatures {
  volume_mount_point = 'rancher.volume_mount_point',
}

export enum SlurmFeatures {
  jobs = 'slurm.jobs',
}

export enum SupportFeatures {
  conceal_change_request = 'support.conceal_change_request',
  pricelist = 'support.pricelist',
  shared_providers = 'support.shared_providers',
  users = 'support.users',
  vm_type_overview = 'support.vm_type_overview',
}

export enum TelemetryFeatures {
  send_metrics = 'telemetry.send_metrics',
}

export enum UserFeatures {
  notifications = 'user.notifications',
  preferred_language = 'user.preferred_language',
  ssh_keys = 'user.ssh_keys',
}

export type FeaturesEnum =
  | CustomerFeatures
  | InvitationsFeatures
  | MarketplaceFeatures
  | OpenstackFeatures
  | ProjectFeatures
  | RancherFeatures
  | SlurmFeatures
  | SupportFeatures
  | TelemetryFeatures
  | UserFeatures
;
