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
    auth_logged_in_with_pki: 'auth_logged_in_with_pki',
    auth_logged_in_with_username: 'auth_logged_in_with_username',
    auth_logged_out: 'auth_logged_out',
    customer_account_credited: 'customer_account_credited',
    customer_account_debited: 'customer_account_debited',
    customer_creation_succeeded: 'customer_creation_succeeded',
    customer_deletion_succeeded: 'customer_deletion_succeeded',
    customer_update_succeeded: 'customer_update_succeeded',
    iaas_backup_creation_failed: 'iaas_backup_creation_failed',
    iaas_backup_creation_scheduled: 'iaas_backup_creation_scheduled',
    iaas_backup_creation_succeeded: 'iaas_backup_creation_succeeded',
    iaas_backup_deletion_failed: 'iaas_backup_deletion_failed',
    iaas_backup_deletion_scheduled: 'iaas_backup_deletion_scheduled',
    iaas_backup_deletion_succeeded: 'iaas_backup_deletion_succeeded',
    iaas_backup_restoration_failed: 'iaas_backup_restoration_failed',
    iaas_backup_restoration_scheduled: 'iaas_backup_restoration_scheduled',
    iaas_backup_restoration_succeeded: 'iaas_backup_restoration_succeeded',
    iaas_backup_schedule_activated: 'iaas_backup_schedule_activated',
    iaas_backup_schedule_creation_succeeded: 'iaas_backup_schedule_creation_succeeded',
    iaas_backup_schedule_deactivated: 'iaas_backup_schedule_deactivated',
    iaas_backup_schedule_deletion_succeeded: 'iaas_backup_schedule_deletion_succeeded',
    iaas_backup_schedule_update_succeeded: 'iaas_backup_schedule_update_succeeded',
    invoice_creation_succeeded: 'invoice_creation_succeeded',
    invoice_deletion_succeeded: 'invoice_deletion_succeeded',
    invoice_update_succeeded: 'invoice_update_succeeded',
    payment_approval_succeeded: 'payment_approval_succeeded',
    payment_cancel_succeeded: 'payment_cancel_succeeded',
    payment_creation_succeeded: 'payment_creation_succeeded',
    project_added_to_project_group: 'project_added_to_project_group',
    project_creation_succeeded: 'project_creation_succeeded',
    project_deletion_succeeded: 'project_deletion_succeeded',
    project_group_creation_succeeded: 'project_group_creation_succeeded',
    project_group_deletion_succeeded: 'project_group_deletion_succeeded',
    project_group_update_succeeded: 'project_group_update_succeeded',
    project_removed_from_project_group: 'project_removed_from_project_group',
    project_update_succeeded: 'project_update_succeeded',
    role_granted: 'role_granted',
    role_revoked: 'role_revoked',
    ssh_key_creation_succeeded: 'ssh_key_creation_succeeded',
    ssh_key_deletion_succeeded: 'ssh_key_deletion_succeeded',
    template_creation_succeeded: 'template_creation_succeeded',
    template_deletion_succeeded: 'template_deletion_succeeded',
    template_service_creation_succeeded: 'template_service_creation_succeeded',
    template_service_deletion_succeeded: 'template_service_deletion_succeeded',
    template_service_update_succeeded: 'template_service_update_succeeded',
    template_update_succeeded: 'template_update_succeeded',
    user_activated: 'user_activated',
    user_creation_succeeded: 'user_creation_succeeded',
    user_deactivated: 'user_deactivated',
    user_deletion_succeeded: 'user_deletion_succeeded',
    user_organization_approved: 'user_organization_approved',
    user_organization_claimed: 'user_organization_claimed',
    user_organization_rejected: 'user_organization_rejected',
    user_organization_removed: 'user_organization_removed',
    user_password_updated: 'user_password_updated',
    user_update_succeeded: 'user_update_succeeded'
  });
})();

(function() {
    angular.module('ncsaas').service('eventRegistry', ['EVENTTYPE', eventRegistry]);

    function eventRegistry(EVENTTYPE) {

        function type_to_entity(type) {
            return type.split("_")[0];
        }

        function types_to_entities(types) {
            var entities = [];
            for (var i = 0; i < types.length; i++) {
                var entity = type_to_entity(types[i]);
                if (entities.indexOf(entity) == -1) {
                    entities.push(entity)
                }
            }
            entities.sort();
            return entities;
        }

        function entities_to_types(entities) {
            var types = [];
            for(var type in EVENTTYPE) {
                var entity = type_to_entity(type);
                if (entities.indexOf(entity) != -1) {
                    types.push(type);
                }
            }
            types.sort();
            return types;
        }

        function get_entities() {
            var types = [];
            for(var type in EVENTTYPE) {
                types.push(type);
            }
            var entities = types_to_entities(types);
            entities.sort(function(a, b) {
              return a.localeCompare(b);
            });
            return entities;
        }

        return {
            entities: get_entities(),
            types_to_entities: types_to_entities,
            entities_to_types: entities_to_types
        }
    }
})();
