'use strict';

(function() {
  angular.module('ncsaas')
    .service('eventsService', ['baseServiceClass', eventsService]);

  function eventsService(baseServiceClass) {
    /*jshint validthis: true */
    var ServiceClass = baseServiceClass.extend({
      init:function() {
        this._super();
        this.endpoint = '/events/';
        this.filterByCustomer = false;
      }
    });
    return new ServiceClass();
  }

})();

(function() {
  angular.module('ncsaas').constant('EVENTTYPE', {
    user_creation_succeeded: 'user_creation_succeeded',
    user_password_updated: 'user_password_updated',
    user_activated: 'user_activated',
    user_deactivated: 'user_deactivated',
    user_update_succeeded: 'user_update_succeeded',
    user_deletion_succeeded: 'user_deletion_succeeded',
    ssh_key_creation_succeeded: 'ssh_key_creation_succeeded',
    ssh_key_deletion_succeeded: 'ssh_key_deletion_succeeded',
    iaas_backup_creation_scheduled: 'iaas_backup_schedule_deactivated',
    iaas_backup_creation_failed: 'iaas_backup_creation_failed',
    iaas_backup_creation_succeeded: 'iaas_backup_creation_succeeded',
    iaas_backup_restoration_scheduled: 'iaas_backup_restoration_scheduled',
    iaas_backup_restoration_failed: 'iaas_backup_restoration_failed',
    iaas_backup_restoration_succeeded: 'iaas_backup_restoration_succeeded',
    iaas_backup_deletion_scheduled: 'iaas_backup_deletion_scheduled',
    iaas_backup_deletion_failed: 'iaas_backup_deletion_failed',
    iaas_backup_deletion_succeeded: 'iaas_backup_deletion_succeeded',
    auth_logged_in_with_username: 'auth_logged_in_with_username',
    auth_logged_in_with_pki: 'auth_logged_in_with_pki',
    iaas_instance_creation_scheduled: 'iaas_instance_creation_scheduled',
    iaas_instance_creation_failed: 'iaas_instance_creation_failed',
    iaas_instance_creation_succeeded: 'iaas_instance_creation_succeeded',
    iaas_instance_start_succeeded: 'iaas_instance_start_succeeded',
    iaas_instance_start_failed: 'iaas_instance_start_failed',
    iaas_instance_stop_succeeded: 'iaas_instance_stop_succeeded',
    iaas_instance_stop_failed: 'iaas_instance_stop_failed',
    iaas_instance_restart_failed: 'iaas_instance_restart_failed',
    iaas_instance_restart_succeeded: 'iaas_instance_restart_succeeded',
    iaas_instance_deletion_failed: 'iaas_instance_deletion_failed',
    iaas_instance_deletion_succeeded: 'iaas_instance_deletion_succeeded',
    iaas_instance_import_succeeded: 'iaas_instance_import_succeeded',
    iaas_instance_volume_extension_failed: 'iaas_instance_volume_extension_failed',
    iaas_instance_volume_extension_succeeded: 'iaas_instance_volume_extension_succeeded',
    iaas_instance_flavor_change_failed: 'iaas_instance_flavor_change_failed',
    iaas_instance_flavor_change_succeeded: 'iaas_instance_flavor_change_succeeded',
    role_granted: 'role_granted',
    role_revoked: 'role_revoked',
    iaas_service_sync_failed: 'iaas_service_sync_failed',
    customer_creation_succeeded: 'customer_creation_succeeded',
    customer_update_succeeded: 'customer_update_succeeded',
    customer_deletion_succeeded: 'customer_deletion_succeeded',
    project_group_creation_succeeded: 'project_group_creation_succeeded',
    project_group_update_succeeded: 'project_group_update_succeeded',
    project_group_deletion_succeeded: 'project_group_deletion_succeeded',
    project_creation_succeeded: 'project_creation_succeeded',
    project_update_succeeded: 'project_update_succeeded',
    project_deletion_succeeded: 'project_deletion_succeeded',
    role_granted_structure_type_project: 'project',
    role_granted_structure_type_customer: 'customer'
  });
})();
