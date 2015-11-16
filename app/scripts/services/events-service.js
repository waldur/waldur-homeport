'use strict';

(function() {
  angular.module('ncsaas')
    .service('eventsService', ['baseServiceClass', 'ENV', '$rootScope', eventsService]);

  function eventsService(baseServiceClass, ENV, $rootScope) {
    /*jshint validthis: true */
    var ServiceClass = baseServiceClass.extend({
      init:function() {
        this._super();
        this.endpoint = '/events/';
        this.filterByCustomer = false;

        var vm = this;
        $rootScope.$on('$stateChangeSuccess', function() {
          vm.setDefaultFilter();
        });
        vm.setDefaultFilter();
      },
      setDefaultFilter: function() {
        this.defaultFilter.exclude_extra = true;
        if (!ENV.featuresVisible) {
          this.defaultFilter.exclude_features = ENV.toBeFeatures;
        }
      }
    });
    return new ServiceClass();
  }
})();

(function() {
    var templates = {
        'auth_logged_in_with_username': 'User {user_full_name} authenticated successfully with username and password.',
        'customer_account_credited': 'Balance has been increased by {amount} for customer {customer_name}.',
        'customer_account_debited': 'Balance has been decreased by {amount} for customer {customer_name}.',
        'customer_creation_succeeded': 'Organization {customer_name} has been created.',
        'customer_deletion_succeeded': 'Organization {customer_name} has been deleted.',
        'customer_update_succeeded': 'Organization {customer_name} has been updated.',
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
        'iaas_service_sync_failed': 'OpenStack cloud {cloud_name} has failed to sync.',
        'invoice_creation_succeeded': 'Invoice for organization {customer_name} for the period of {invoice_date} has been created.',
        'invoice_deletion_succeeded': 'Invoice for organization {customer_name} for the period of {invoice_date} has been deleted.',
        'invoice_update_succeeded': 'Invoice for organization {customer_name} for the period of {invoice_date} has been updated.',
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
        'role_granted': 'User {affected_user_full_name} has gained role of {role_name} in {project_name} of {customer_name}.',
        'role_revoked': 'User {affected_user_full_name} has revoked role of {role_name} in {project_name} of {customer_name}.',
        'ssh_key_creation_succeeded': 'SSH key {ssh_key_name} has been created.',
        'ssh_key_deletion_succeeded': 'SSH key {ssh_key_name} has been deleted.',
        'ssh_key_push_succeeded': 'SSH key {ssh_key_name} has been pushed to {service_name} in {project_name}.',
        'ssh_key_push_failed': 'Failed to push SSH key {ssh_key_name} to {service_name} in {project_name}.',
        'ssh_key_remove_succeeded': 'SSH key {ssh_key_name} has been removed from {service_name} in {project_name}.',
        'ssh_key_remove_failed': 'Failed to delete SSH key {ssh_key_name} from {service_name} in {project_name}.',
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

angular.module('ncsaas').constant('EVENT_ROUTES', {
    'affected_user': 'users.details',
    'user': 'users.details',
    'project': 'projects.details',
    'customer': 'organizations.details',
    'affected_organization': 'organizations.details',
    'instance': 'resources.details',
    'iaas_instance': 'resources.details',
    'resource': 'resources.details',
});

angular.module('ncsaas').constant('EVENT_ICONS', {
    'auth_logged_in_with_username': 'user',
    'customer_account_credited': 'customer',
    'customer_account_debited': 'customer',
    'customer_creation_succeeded': 'customer',
    'customer_deletion_succeeded': 'customer',
    'customer_update_succeeded': 'customer',
    'iaas_backup_creation_failed': 'resource',
    'iaas_backup_creation_scheduled': 'resource',
    'iaas_backup_creation_succeeded': 'resource',
    'iaas_backup_deletion_failed': 'resource',
    'iaas_backup_deletion_scheduled': 'resource',
    'iaas_backup_deletion_succeeded': 'resource',
    'iaas_backup_restoration_failed': 'resource',
    'iaas_backup_restoration_scheduled': 'resource',
    'iaas_backup_restoration_succeeded': 'resource',
    'iaas_backup_schedule_activated': 'resource',
    'iaas_backup_schedule_creation_succeeded': 'resource',
    'iaas_backup_schedule_deactivated': 'resource',
    'iaas_backup_schedule_deletion_succeeded': 'resource',
    'iaas_backup_schedule_update_succeeded': 'resource',
    'iaas_instance_application_became_available': 'resource',
    'iaas_instance_application_deployment_succeeded': 'resource',
    'iaas_instance_application_failed': 'resource',
    'iaas_instance_creation_failed': 'resource',
    'iaas_instance_creation_scheduled': 'resource',
    'iaas_instance_creation_succeeded': 'resource',
    'iaas_instance_deletion_failed': 'resource',
    'iaas_instance_deletion_succeeded': 'resource',
    'iaas_instance_flavor_change_failed': 'resource',
    'iaas_instance_flavor_change_scheduled': 'resource',
    'iaas_instance_flavor_change_succeeded': 'resource',
    'iaas_instance_import_failed': 'resource',
    'iaas_instance_import_scheduled': 'resource',
    'iaas_instance_import_succeeded': 'resource',
    'iaas_instance_licenses_added': 'resource',
    'iaas_instance_restart_failed': 'resource',
    'iaas_instance_restart_succeeded': 'resource',
    'iaas_instance_start_failed': 'resource',
    'iaas_instance_start_succeeded': 'resource',
    'iaas_instance_stop_failed': 'resource',
    'iaas_instance_stop_succeeded': 'resource',
    'iaas_instance_update_succeeded': 'resource',
    'iaas_instance_volume_extension_scheduled': 'resource',
    'iaas_membership_sync_failed': 'service',
    'iaas_service_sync_failed': 'service',
    'invoice_creation_succeeded': 'customer',
    'invoice_deletion_succeeded': 'customer',
    'invoice_update_succeeded': 'customer',
    'payment_approval_succeeded': 'customer',
    'payment_cancel_succeeded': 'customer',
    'payment_creation_succeeded': 'customer',
    'project_added_to_project_group': 'project',
    'project_creation_succeeded': 'project',
    'project_deletion_succeeded': 'project',
    'project_group_creation_succeeded': 'project',
    'project_group_deletion_succeeded': 'project',
    'project_group_update_succeeded': 'project',
    'project_removed_from_project_group': 'project',
    'project_update_succeeded': 'project',
    'quota_threshold_reached': 'customer',
    'resource_created': 'resource',
    'resource_deleted': 'resource',
    'resource_imported': 'resource',
    'role_granted': 'user',
    'role_revoked': 'user',
    'ssh_key_creation_succeeded': 'key',
    'ssh_key_deletion_succeeded': 'key',
    'ssh_key_push_succeeded': 'key',
    'ssh_key_push_failed': 'key',
    'ssh_key_remove_succeeded': 'key',
    'ssh_key_remove_failed': 'key',
    'template_creation_succeeded': 'resource',
    'template_deletion_succeeded': 'resource',
    'template_service_creation_succeeded': 'resource',
    'template_service_deletion_succeeded': 'resource',
    'template_service_update_succeeded': 'resource',
    'template_update_succeeded': 'resource',
    'user_activated': 'user',
    'user_creation_succeeded': 'user',
    'user_deactivated': 'user',
    'user_deletion_succeeded': 'user',
    'user_organization_approved': 'user',
    'user_organization_claimed': 'user',
    'user_organization_rejected': 'user',
    'user_organization_removed': 'user',
    'user_password_updated': 'user',
    'user_update_succeeded': 'user',
    'zabbix_host_creation_failed': 'resource',
    'zabbix_host_creation_succeeded': 'resource',
    'zabbix_host_deletion_failed': 'resource',
    'zabbix_host_deletion_succeeded': 'resource'
});


(function() {
    angular.module('ncsaas').service('BaseEventFormatter', ['EVENT_ROUTES', '$state', BaseEventFormatter]);

    function BaseEventFormatter(EVENT_ROUTES, $state) {
        return Class.extend({
            format: function(event) {
                var template = this.getTemplate(event);
                if (!template) {
                    return event.message;
                }
                var eventContext = this.getEventContext(event);
                var fields = this.findFields(template);
                var templateContext = this.getTemplateContext(eventContext, fields);
                return this.renderTemplate(template, templateContext);
            },
            getTemplateContext: function(eventContext, fields) {
                var entities = this.fieldsToEntities(eventContext, fields);
                var templateContext = {};
                // Fill hyperlinks for entities
                if (this.showLinks(eventContext)) {
                    for (var field in entities) {
                        var entity = entities[field];
                        var url = this.formatUrl(entity, eventContext);
                        if (url) {
                            templateContext[field] = '<a href="' + url + '" class="name">' + eventContext[field] + '</a>';
                        }
                    }
                }

                // Fill other fields
                for (var i = 0; i < fields.length; i++) {
                    var field = fields[i];
                    if (!templateContext[field]) {
                        if (eventContext[field] != undefined) {
                            templateContext[field] = eventContext[field];
                        } else {
                            templateContext[field] = '';
                        }
                    }
                }
                return templateContext;
            },
            showLinks: function(context) {
                return true;
            },
            routeEnabled: function(route) {
                return true;
            },
            getTemplate: function(event) {
                return null;
            },
            getEventContext: function(event) {
                return {};
            },
            formatUrl: function(entity, context) {
                var route = EVENT_ROUTES[entity];
                if (!this.routeEnabled(route)) {
                    return;
                }
                var uuid = context[entity + "_uuid"];
                var args = {uuid: uuid};
                if (entity == 'cloud_account' || entity == 'cloud') {
                    args['provider'] = 'IaaS';
                }
                if (entity == 'service') {
                    args['provider'] = context['service_type'];
                }
                if (entity == 'resource') {
                    args['resource_type'] = context['resource_type'];
                }
                return $state.href(route, args);
            },
            findAll: function(re, s) {
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
            },
            templateFields: {},
            findFields: function(template) {
                // Input: 
                // "User {affected_user_username} has gained role of {role_name} in {project_name}."
                // Output:
                // ["affected_user_username", "role_name", "project_name"]
                if (!this.templateFields[template]) {
                    this.templateFields[template] = this.findAll(/\{([^{]+)\}/g, template);
                }
                return this.templateFields[template];
            },
            fieldsToEntities: function(event, fields) {
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
            },
            renderTemplate: function(template, params) {
                for (var key in params) {
                    template = template.replace("{" + key + "}", params[key]);
                }
                return template;
            }
        });
    }
})();

(function() {
    angular.module('ncsaas').service('eventFormatter', [
        'EVENT_TEMPLATES', 'EVENT_ICONS', 'ENV', 'BaseEventFormatter', eventFormatter]);

    function eventFormatter(EVENT_TEMPLATES, EVENT_ICONS, ENV, BaseEventFormatter) {
        var cls = BaseEventFormatter.extend({
            getTemplate: function(event) {
                return EVENT_TEMPLATES[event.event_type];
            },
            getEventContext: function(event) {
                return event;
            },
            deletionEvents: [
                'customer_deletion_succeeded',
                'iaas_backup_deletion_scheduled',
                'iaas_backup_schedule_deletion_succeeded',
                'iaas_instance_deletion_succeeded',
                'invoice_deletion_succeeded',
                'project_deletion_succeeded',
                'project_group_deletion_succeeded',
                'resource_deleted',
                'ssh_key_deletion_succeeded',
                'template_deletion_succeeded',
                'template_service_deletion_succeeded',
                'user_deletion_succeeded',
                'zabbix_host_deletion_succeeded'
            ],
            showLinks: function(context) {
                // Don't show links for deletion events
                return (this.deletionEvents.indexOf(context.event_type) == -1);
            },
            routeEnabled: function(route) {
                if (!route) {
                    return false;
                }
                if (ENV.featuresVisible) {
                    return true;
                }
                var parts = route.split(".");
                for (var i = 0; i < parts.length; i++) {
                    var part = parts[i];
                    if (ENV.toBeFeatures.indexOf(part) != -1) {
                        return false;
                    }
                }
                return true;
            },
            getIcon: function(event) {
              return EVENT_ICONS[event.event_type];
            }
        });
        return new cls();
    }
})();
