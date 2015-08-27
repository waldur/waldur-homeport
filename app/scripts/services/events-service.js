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
    var templates = {
        'auth_logged_in_with_username': 'User {user_username} with full name {user_full_name} authenticated successfully with username and password.',
        'customer_account_credited': 'Balance has been increased by {amount} for customer {customer_name}.',
        'customer_account_debited': 'Balance has been decreased by {amount} for customer {customer_name}.',
        'customer_creation_succeeded': 'Customer {customer_name} has been created.',
        'customer_deletion_succeeded': 'Customer {customer_name} has been deleted.',
        'customer_update_succeeded': 'Customer {customer_name} has been updated.',
        'iaas_backup_creation_failed': 'Backup creation for {iaas_instance_name} has failed.',
        'iaas_backup_creation_scheduled': 'Backup for {iaas_instance_name} has been scheduled.',
        'iaas_backup_creation_succeeded': 'Backup for {iaas_instance_name} has been created.',
        'iaas_backup_deletion_failed': 'Backup deletion for {iaas_instance_name} has failed.',
        'iaas_backup_deletion_scheduled': 'Backup deletion for {iaas_instance_name} has been scheduled.',
        'iaas_backup_deletion_succeeded': 'Backup for {iaas_instance_name} has been deleted.',
        'iaas_backup_restoration_failed': 'Backup restoration for {iaas_instance_name} has failed.',
        'iaas_backup_restoration_scheduled': 'Backup restoration for {iaas_instance_name} has been scheduled.',
        'iaas_backup_restoration_succeeded': 'Backup for {iaas_instance_name} has been restored.',
        'iaas_backup_schedule_activated': 'Backup schedule for {iaas_instance_name} has been activated.',
        'iaas_backup_schedule_creation_succeeded': 'Backup schedule for {iaas_instance_name} has been created.',
        'iaas_backup_schedule_deactivated': 'Backup schedule for {iaas_instance_name} has been deactivated.',
        'iaas_backup_schedule_deletion_succeeded': 'Backup schedule for {iaas_instance_name} has been deleted.',
        'iaas_backup_schedule_update_succeeded': 'Backup schedule for {iaas_instance_name} has been updated.',
        'iaas_instance_application_became_available': 'Application has become available on {instance_name}.',
        'iaas_instance_application_deployment_succeeded': 'Application has been deployed on {instance_name}.',
        'iaas_instance_application_failed': 'Application has failed on {instance_name}.',
        'iaas_instance_creation_failed': 'Virtual machine {instance_name} creation has failed.',
        'iaas_instance_creation_scheduled': 'Virtual machine {instance_name} creation has been scheduled.',
        'iaas_instance_creation_succeeded': 'Virtual machine {instance_name} has been created.',
        'iaas_instance_deletion_failed': 'Virtual machine {instance_name} deletion has failed.',
        'iaas_instance_deletion_succeeded': 'Virtual machine {instance_name} has been deleted.',
        'iaas_instance_flavor_change_failed': 'Virtual machine {instance_name} flavor change has failed.',
        'iaas_instance_flavor_change_scheduled': 'Virtual machine {instance_name} has been scheduled to change flavor.',
        'iaas_instance_flavor_change_succeeded': 'Virtual machine {instance_name} flavor has been changed to {flavor_name}.',
        'iaas_instance_import_failed': 'Import of a virtual machine with backend id {instance_id} has failed.',
        'iaas_instance_import_scheduled': 'Virtual machine with backend id {instance_id} has been scheduled for import.',
        'iaas_instance_import_succeeded': 'Virtual machine {instance_id} has been imported.',
        'iaas_instance_licenses_added': 'Licenses added to VM with name {instance_name}.',
        'iaas_instance_restart_failed': 'Virtual machine {instance_name} restart has failed.',
        'iaas_instance_restart_succeeded': 'Virtual machine {instance_name} has been restarted.',
        'iaas_instance_start_failed': 'Virtual machine {instance_name} start has failed.',
        'iaas_instance_start_succeeded': 'Virtual machine {instance_name} has been started.',
        'iaas_instance_stop_failed': 'Virtual machine {instance_name} stop has failed.',
        'iaas_instance_stop_succeeded': 'Virtual machine {instance_name} has been stopped.',
        'iaas_instance_update_succeeded': 'Virtual machine {instance_name} has been updated.',
        'iaas_instance_volume_extension_scheduled': 'Virtual machine {instance_name} has been scheduled to extend disk.',
        'iaas_membership_sync_failed': 'Failed to sync cloud membership {cloud_name}.',
        'iaas_service_sync_failed': 'Cloud service {cloud_name} has failed to sync.',
        'invoice_creation_succeeded': 'Invoice for customer {customer_name} for the period of {invoice_date} has been created.',
        'invoice_deletion_succeeded': 'Invoice for customer {customer_name} for the period of {invoice_date} has been deleted.',
        'invoice_update_succeeded': 'Invoice for customer {customer_name} for the period of {invoice_date} has been updated.',
        'payment_approval_succeeded': 'Payment for {customer_name} has been approved',
        'payment_cancel_succeeded': 'Payment for {customer_name} has been cancelled',
        'payment_creation_succeeded': 'Created new payment for {customer_name}',
        'project_added_to_project_group': 'Project {project_name} has been added to project group {project_group_name}.',
        'project_creation_succeeded': 'Project {project_name} has been created.',
        'project_deletion_succeeded': 'Project {project_name} has been deleted.',
        'project_group_creation_succeeded': 'Project group {project_group_name} has been created.',
        'project_group_deletion_succeeded': 'Project group {project_group_name} has been deleted.',
        'project_group_update_succeeded': 'Project group {project_group_name} has been updated.',
        'project_removed_from_project_group': 'Project {project_name} has been removed from project group {project_group_name}.',
        'project_update_succeeded': 'Project {project_name} has been updated.',
        'quota_threshold_reached': '{quota_name} quota threshold has been reached for project {project_name}.',
        'resource_created': 'Resource {resource_name} has been created.',
        'resource_deleted': 'Resource {resource_name} has been deleted.',
        'resource_imported': 'Resource {resource_name} has been imported.',
        'role_granted': 'User {affected_user_full_name} has gained role of {role_name} in {project_name} {customer_name}.',
        'role_revoked': 'User {affected_user_full_name} has revoked role of {role_name} in {project_name} {customer_name}.',
        'ssh_key_creation_succeeded': 'SSH key {ssh_key_name} has been created.',
        'ssh_key_deletion_succeeded': 'SSH key {ssh_key_name} has been deleted.',
        'template_creation_succeeded': 'Template {template_name} has been created.',
        'template_deletion_succeeded': 'Template {template_name} has been deleted.',
        'template_service_creation_succeeded': 'Template {template_service_name} has been created.',
        'template_service_deletion_succeeded': 'Template {template_service_name} has been deleted.',
        'template_service_update_succeeded': 'Template {template_service_name} has been updated.',
        'template_update_succeeded': 'Template {template_name} has been updated.',
        'user_activated': 'User {affected_user_full_name} has been activated.',
        'user_creation_succeeded': 'User {affected_user_full_name} has been created.',
        'user_deactivated': 'User {affected_user_full_name} has been deactivated.',
        'user_deletion_succeeded': 'User {affected_user_full_name} has been deleted.',
        'user_organization_approved': 'User {affected_user_full_name} has been approved for organization {affected_organization}.',
        'user_organization_claimed': 'User {affected_user_full_name} has claimed organization {affected_organization}.',
        'user_organization_rejected': 'User {affected_user_full_name} claim for organization {affected_organization} has been rejected.',
        'user_organization_removed': 'User {affected_user_full_name} has been removed from organization {affected_organization}.',
        'user_password_updated': 'Password has been changed for user {affected_user_full_name}.',
        'user_update_succeeded': 'User {affected_user_full_name} has been updated.',
        'zabbix_host_creation_failed': 'Unable to add instance {instance_name} to Zabbix',
        'zabbix_host_creation_succeeded': 'Added instance {instance_name} to Zabbix',
        'zabbix_host_deletion_failed': 'Unable to delete instance {instance_name} from Zabbix',
        'zabbix_host_deletion_succeeded': 'Deleted instance {instance_name} from Zabbix'
    };
    angular.module('ncsaas').constant('EVENT_TEMPLATES', templates);

    var types = {};
    for(var key in templates) {
        types[key] = key;
    }
    angular.module('ncsaas').constant('EVENTTYPE', types);
})();


angular.module('ncsaas').constant('EVENT_ROUTES', {
    'affected_user': 'users.details',
    'user': 'users.details',
    'project': 'resources.details',
    'customer': 'organizations.details',
    'affected_organization': 'organizations.details',
    'cloud_account': 'services.details',
    'cloud': 'services.details',
    'instance': 'resources.details',
    'iaas_instance': 'resources.details'
});

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

(function() {
    angular.module('ncsaas').service('eventFormatter', ['EVENT_TEMPLATES', 'EVENT_ROUTES', '$state', eventFormatter]);

    function eventFormatter(EVENT_TEMPLATES, EVENT_ROUTES, $state) {
        return {
            format: function(event) {
                var template = EVENT_TEMPLATES[event.event_type];
                if (!template) {
                    return event.message;
                }

                var fields = findFields(template);
                var entities = fieldsToEntities(event, fields);
                var context = {};
                // Fill hyperlinks for entities
                for (var field in entities) {
                    var entity = entities[field];
                    var route = EVENT_ROUTES[entity];
                    var uuid = event[entity + "_uuid"];
                    var args = {uuid: uuid};
                    if (entity == 'cloud_account' || entity == 'cloud') {
                        args['provider'] = 'IaaS';
                    }
                    var url = $state.href(route, args);
                    context[field] = '<a href="' + url + '" class="name">' + event[field] + '</a>';
                }

                // Fill other fields
                for (var i = 0; i < fields.length; i++) {
                    var field = fields[i];
                    if (!context[field]) {
                        if (event[field]) {
                            context[field] = event[field];
                        } else {
                            context[field] = '';
                        }
                    }
                }
                return renderTemplate(template, context);
            }
        }
    }

    function findAll(re, s) {
        // Find all matches of regular expression pattern in the string
        var match;
        var matches = [];
        do {
            match = re.exec(s);
            if (match) {
                matches.push(match[1]);
            }
        } while (match);
        return matches;
    }

    var templateFields = {};
    function findFields(template) {
        // Input: 
        // "User {affected_user_username} has gained role of {role_name} in {project_name}."
        // Output:
        // ["affected_user_username", "role_name", "project_name"]
        if (!templateFields[template]) {
            templateFields[template] = findAll(/\{([^{]+)\}/g, template);
        }
        return templateFields[template];
    }

    function fieldsToEntities(event, fields) {
        // Example output:
        // {"affected_user_username": "affected_user", "project_name": "project"}

        var entities = {};
        for(var key in event) {
            if (/_uuid$/.test(key)) {
                var name = key.replace(/_uuid$/, '');
                entities[name] = true;
            }
        }

        var table = {};
        for (var name in entities) {
            for (var i = 0; i < fields.length; i++) {
                var field = fields[i];
                if (field.startsWith(name) && !table[field]) {
                    table[field] = name;
                }
            }
        }
        return table;
    }

    function renderTemplate(template, params) {
        for (var key in params) {
            template = template.replace("{" + key + "}", params[key]);
        }
        return template;
    }
})();
