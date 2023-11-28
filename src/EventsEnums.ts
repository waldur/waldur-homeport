/* eslint-disable */
// WARNING: This file is auto-generated from src/waldur_core/core/management/commands/print_events_typescript.py
// Do not edit it manually. All manual changes would be overridden.

export const AuthEnum = {
  auth_logged_in_with_username: 'auth_logged_in_with_username',
  auth_logged_out: 'auth_logged_out',
  auth_login_failed_with_username: 'auth_login_failed_with_username',
  token_created: 'token_created',
  token_lifetime_updated: 'token_lifetime_updated',
};

export const CustomersEnum = {
  customer_creation_succeeded: 'customer_creation_succeeded',
  customer_deletion_succeeded: 'customer_deletion_succeeded',
  customer_update_succeeded: 'customer_update_succeeded',
  invoice_canceled: 'invoice_canceled',
  invoice_created: 'invoice_created',
  invoice_item_created: 'invoice_item_created',
  invoice_item_deleted: 'invoice_item_deleted',
  invoice_item_updated: 'invoice_item_updated',
  invoice_paid: 'invoice_paid',
  payment_added: 'payment_added',
  payment_created: 'payment_created',
  payment_removed: 'payment_removed',
  role_granted: 'role_granted',
  role_revoked: 'role_revoked',
  role_updated: 'role_updated',
};

export const InvoicesEnum = {
  invoice_canceled: 'invoice_canceled',
  invoice_created: 'invoice_created',
  invoice_creation_succeeded: 'invoice_creation_succeeded',
  invoice_deletion_succeeded: 'invoice_deletion_succeeded',
  invoice_item_created: 'invoice_item_created',
  invoice_item_deleted: 'invoice_item_deleted',
  invoice_item_updated: 'invoice_item_updated',
  invoice_paid: 'invoice_paid',
  invoice_update_succeeded: 'invoice_update_succeeded',
  payment_created: 'payment_created',
  payment_removed: 'payment_removed',
};

export const JiraEnum = {
  comment_creation_succeeded: 'comment_creation_succeeded',
  comment_deletion_succeeded: 'comment_deletion_succeeded',
  comment_update_succeeded: 'comment_update_succeeded',
  issue_creation_succeeded: 'issue_creation_succeeded',
  issue_deletion_succeeded: 'issue_deletion_succeeded',
  issue_update_succeeded: 'issue_update_succeeded',
};

export const PaymentsEnum = {
  payment_approval_succeeded: 'payment_approval_succeeded',
  payment_cancel_succeeded: 'payment_cancel_succeeded',
  payment_creation_succeeded: 'payment_creation_succeeded',
};

export const ProjectsEnum = {
  project_creation_succeeded: 'project_creation_succeeded',
  project_deletion_succeeded: 'project_deletion_succeeded',
  project_deletion_triggered: 'project_deletion_triggered',
  project_update_request_approved: 'project_update_request_approved',
  project_update_request_created: 'project_update_request_created',
  project_update_request_rejected: 'project_update_request_rejected',
  project_update_succeeded: 'project_update_succeeded',
  role_granted: 'role_granted',
  role_revoked: 'role_revoked',
  role_updated: 'role_updated',
};

export const ProvidersEnum = {
  marketplace_resource_create_canceled: 'marketplace_resource_create_canceled',
  marketplace_resource_create_failed: 'marketplace_resource_create_failed',
  marketplace_resource_create_requested:
    'marketplace_resource_create_requested',
  marketplace_resource_create_succeeded:
    'marketplace_resource_create_succeeded',
  marketplace_resource_renamed: 'marketplace_resource_renamed',
  marketplace_resource_terminate_failed:
    'marketplace_resource_terminate_failed',
  marketplace_resource_terminate_requested:
    'marketplace_resource_terminate_requested',
  marketplace_resource_terminate_succeeded:
    'marketplace_resource_terminate_succeeded',
  marketplace_resource_update_failed: 'marketplace_resource_update_failed',
  marketplace_resource_update_limits_failed:
    'marketplace_resource_update_limits_failed',
  marketplace_resource_update_limits_succeeded:
    'marketplace_resource_update_limits_succeeded',
  marketplace_resource_update_requested:
    'marketplace_resource_update_requested',
  resource_robot_account_created: 'resource_robot_account_created',
  resource_robot_account_deleted: 'resource_robot_account_deleted',
  resource_robot_account_updated: 'resource_robot_account_updated',
  role_granted: 'role_granted',
  role_revoked: 'role_revoked',
  role_updated: 'role_updated',
};

export const ResourcesEnum = {
  marketplace_order_approved: 'marketplace_order_approved',
  marketplace_order_completed: 'marketplace_order_completed',
  marketplace_order_created: 'marketplace_order_created',
  marketplace_order_failed: 'marketplace_order_failed',
  marketplace_order_rejected: 'marketplace_order_rejected',
  marketplace_order_terminated: 'marketplace_order_terminated',
  marketplace_resource_create_canceled: 'marketplace_resource_create_canceled',
  marketplace_resource_create_failed: 'marketplace_resource_create_failed',
  marketplace_resource_create_requested:
    'marketplace_resource_create_requested',
  marketplace_resource_create_succeeded:
    'marketplace_resource_create_succeeded',
  marketplace_resource_downscaled: 'marketplace_resource_downscaled',
  marketplace_resource_renamed: 'marketplace_resource_renamed',
  marketplace_resource_terminate_failed:
    'marketplace_resource_terminate_failed',
  marketplace_resource_terminate_requested:
    'marketplace_resource_terminate_requested',
  marketplace_resource_terminate_succeeded:
    'marketplace_resource_terminate_succeeded',
  marketplace_resource_update_end_date_succeeded:
    'marketplace_resource_update_end_date_succeeded',
  marketplace_resource_update_failed: 'marketplace_resource_update_failed',
  marketplace_resource_update_limits_failed:
    'marketplace_resource_update_limits_failed',
  marketplace_resource_update_limits_succeeded:
    'marketplace_resource_update_limits_succeeded',
  marketplace_resource_update_requested:
    'marketplace_resource_update_requested',
  marketplace_resource_update_succeeded:
    'marketplace_resource_update_succeeded',
  openstack_flavor_created: 'openstack_flavor_created',
  openstack_flavor_deleted: 'openstack_flavor_deleted',
  openstack_floating_ip_attached: 'openstack_floating_ip_attached',
  openstack_floating_ip_connected: 'openstack_floating_ip_connected',
  openstack_floating_ip_description_updated:
    'openstack_floating_ip_description_updated',
  openstack_floating_ip_detached: 'openstack_floating_ip_detached',
  openstack_floating_ip_disconnected: 'openstack_floating_ip_disconnected',
  openstack_network_cleaned: 'openstack_network_cleaned',
  openstack_network_created: 'openstack_network_created',
  openstack_network_deleted: 'openstack_network_deleted',
  openstack_network_imported: 'openstack_network_imported',
  openstack_network_pulled: 'openstack_network_pulled',
  openstack_network_updated: 'openstack_network_updated',
  openstack_port_cleaned: 'openstack_port_cleaned',
  openstack_port_created: 'openstack_port_created',
  openstack_port_deleted: 'openstack_port_deleted',
  openstack_port_imported: 'openstack_port_imported',
  openstack_port_pulled: 'openstack_port_pulled',
  openstack_router_updated: 'openstack_router_updated',
  openstack_security_group_cleaned: 'openstack_security_group_cleaned',
  openstack_security_group_created: 'openstack_security_group_created',
  openstack_security_group_deleted: 'openstack_security_group_deleted',
  openstack_security_group_imported: 'openstack_security_group_imported',
  openstack_security_group_pulled: 'openstack_security_group_pulled',
  openstack_security_group_rule_cleaned:
    'openstack_security_group_rule_cleaned',
  openstack_security_group_rule_created:
    'openstack_security_group_rule_created',
  openstack_security_group_rule_deleted:
    'openstack_security_group_rule_deleted',
  openstack_security_group_rule_imported:
    'openstack_security_group_rule_imported',
  openstack_security_group_rule_updated:
    'openstack_security_group_rule_updated',
  openstack_security_group_updated: 'openstack_security_group_updated',
  openstack_server_group_cleaned: 'openstack_server_group_cleaned',
  openstack_server_group_created: 'openstack_server_group_created',
  openstack_server_group_deleted: 'openstack_server_group_deleted',
  openstack_server_group_imported: 'openstack_server_group_imported',
  openstack_server_group_pulled: 'openstack_server_group_pulled',
  openstack_subnet_cleaned: 'openstack_subnet_cleaned',
  openstack_subnet_created: 'openstack_subnet_created',
  openstack_subnet_deleted: 'openstack_subnet_deleted',
  openstack_subnet_imported: 'openstack_subnet_imported',
  openstack_subnet_pulled: 'openstack_subnet_pulled',
  openstack_subnet_updated: 'openstack_subnet_updated',
  openstack_tenant_quota_limit_updated: 'openstack_tenant_quota_limit_updated',
  resource_assign_floating_ip_failed: 'resource_assign_floating_ip_failed',
  resource_assign_floating_ip_scheduled:
    'resource_assign_floating_ip_scheduled',
  resource_assign_floating_ip_succeeded:
    'resource_assign_floating_ip_succeeded',
  resource_attach_failed: 'resource_attach_failed',
  resource_attach_scheduled: 'resource_attach_scheduled',
  resource_attach_succeeded: 'resource_attach_succeeded',
  resource_backup_schedule_activated: 'resource_backup_schedule_activated',
  resource_backup_schedule_cleaned_up: 'resource_backup_schedule_cleaned_up',
  resource_backup_schedule_created: 'resource_backup_schedule_created',
  resource_backup_schedule_deactivated: 'resource_backup_schedule_deactivated',
  resource_backup_schedule_deleted: 'resource_backup_schedule_deleted',
  resource_change_flavor_failed: 'resource_change_flavor_failed',
  resource_change_flavor_scheduled: 'resource_change_flavor_scheduled',
  resource_change_flavor_succeeded: 'resource_change_flavor_succeeded',
  resource_creation_failed: 'resource_creation_failed',
  resource_creation_scheduled: 'resource_creation_scheduled',
  resource_creation_succeeded: 'resource_creation_succeeded',
  resource_deletion_failed: 'resource_deletion_failed',
  resource_deletion_scheduled: 'resource_deletion_scheduled',
  resource_deletion_succeeded: 'resource_deletion_succeeded',
  resource_detach_failed: 'resource_detach_failed',
  resource_detach_scheduled: 'resource_detach_scheduled',
  resource_detach_succeeded: 'resource_detach_succeeded',
  resource_extend_failed: 'resource_extend_failed',
  resource_extend_scheduled: 'resource_extend_scheduled',
  resource_extend_succeeded: 'resource_extend_succeeded',
  resource_extend_volume_failed: 'resource_extend_volume_failed',
  resource_extend_volume_scheduled: 'resource_extend_volume_scheduled',
  resource_extend_volume_succeeded: 'resource_extend_volume_succeeded',
  resource_import_succeeded: 'resource_import_succeeded',
  resource_pull_failed: 'resource_pull_failed',
  resource_pull_scheduled: 'resource_pull_scheduled',
  resource_pull_succeeded: 'resource_pull_succeeded',
  resource_restart_failed: 'resource_restart_failed',
  resource_restart_scheduled: 'resource_restart_scheduled',
  resource_restart_succeeded: 'resource_restart_succeeded',
  resource_retype_failed: 'resource_retype_failed',
  resource_retype_scheduled: 'resource_retype_scheduled',
  resource_retype_succeeded: 'resource_retype_succeeded',
  resource_robot_account_created: 'resource_robot_account_created',
  resource_robot_account_deleted: 'resource_robot_account_deleted',
  resource_robot_account_updated: 'resource_robot_account_updated',
  resource_snapshot_schedule_activated: 'resource_snapshot_schedule_activated',
  resource_snapshot_schedule_cleaned_up:
    'resource_snapshot_schedule_cleaned_up',
  resource_snapshot_schedule_created: 'resource_snapshot_schedule_created',
  resource_snapshot_schedule_deactivated:
    'resource_snapshot_schedule_deactivated',
  resource_snapshot_schedule_deleted: 'resource_snapshot_schedule_deleted',
  resource_start_failed: 'resource_start_failed',
  resource_start_scheduled: 'resource_start_scheduled',
  resource_start_succeeded: 'resource_start_succeeded',
  resource_stop_failed: 'resource_stop_failed',
  resource_stop_scheduled: 'resource_stop_scheduled',
  resource_stop_succeeded: 'resource_stop_succeeded',
  resource_unassign_floating_ip_failed: 'resource_unassign_floating_ip_failed',
  resource_unassign_floating_ip_scheduled:
    'resource_unassign_floating_ip_scheduled',
  resource_unassign_floating_ip_succeeded:
    'resource_unassign_floating_ip_succeeded',
  resource_update_allowed_address_pairs_failed:
    'resource_update_allowed_address_pairs_failed',
  resource_update_allowed_address_pairs_scheduled:
    'resource_update_allowed_address_pairs_scheduled',
  resource_update_allowed_address_pairs_succeeded:
    'resource_update_allowed_address_pairs_succeeded',
  resource_update_floating_ips_failed: 'resource_update_floating_ips_failed',
  resource_update_floating_ips_scheduled:
    'resource_update_floating_ips_scheduled',
  resource_update_floating_ips_succeeded:
    'resource_update_floating_ips_succeeded',
  resource_update_internal_ips_failed: 'resource_update_internal_ips_failed',
  resource_update_internal_ips_scheduled:
    'resource_update_internal_ips_scheduled',
  resource_update_internal_ips_succeeded:
    'resource_update_internal_ips_succeeded',
  resource_update_security_groups_failed:
    'resource_update_security_groups_failed',
  resource_update_security_groups_scheduled:
    'resource_update_security_groups_scheduled',
  resource_update_security_groups_succeeded:
    'resource_update_security_groups_succeeded',
  resource_update_succeeded: 'resource_update_succeeded',
};

export const SshEnum = {
  ssh_key_creation_succeeded: 'ssh_key_creation_succeeded',
  ssh_key_deletion_succeeded: 'ssh_key_deletion_succeeded',
};

export const SupportEnum = {
  attachment_created: 'attachment_created',
  attachment_deleted: 'attachment_deleted',
  attachment_updated: 'attachment_updated',
  issue_creation_succeeded: 'issue_creation_succeeded',
  issue_deletion_succeeded: 'issue_deletion_succeeded',
  issue_update_succeeded: 'issue_update_succeeded',
};

export const UsersEnum = {
  auth_logged_in_with_oauth: 'auth_logged_in_with_oauth',
  auth_logged_in_with_saml2: 'auth_logged_in_with_saml2',
  auth_logged_out_with_saml2: 'auth_logged_out_with_saml2',
  freeipa_profile_created: 'freeipa_profile_created',
  freeipa_profile_deleted: 'freeipa_profile_deleted',
  freeipa_profile_disabled: 'freeipa_profile_disabled',
  freeipa_profile_enabled: 'freeipa_profile_enabled',
  marketplace_offering_user_created: 'marketplace_offering_user_created',
  marketplace_offering_user_deleted: 'marketplace_offering_user_deleted',
  role_granted: 'role_granted',
  role_revoked: 'role_revoked',
  role_updated: 'role_updated',
  ssh_key_creation_succeeded: 'ssh_key_creation_succeeded',
  ssh_key_deletion_succeeded: 'ssh_key_deletion_succeeded',
  user_activated: 'user_activated',
  user_creation_succeeded: 'user_creation_succeeded',
  user_deactivated: 'user_deactivated',
  user_deletion_succeeded: 'user_deletion_succeeded',
  user_details_update_succeeded: 'user_details_update_succeeded',
  user_password_updated: 'user_password_updated',
  user_profile_changed: 'user_profile_changed',
  user_update_succeeded: 'user_update_succeeded',
};
