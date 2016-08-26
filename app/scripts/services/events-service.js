'use strict';

(function() {
  angular.module('ncsaas')
    .service('eventsService', [
      '$q', 'baseServiceClass', 'ENV', 'EVENT_ICONS_TYPES', 'EVENT_TEMPLATES', eventsService]);

  function eventsService($q, baseServiceClass, ENV, EVENT_ICONS_TYPES, EVENT_TEMPLATES) {
    /*jshint validthis: true */
    var ServiceClass = baseServiceClass.extend({
      init: function() {
        this._super();
        this.endpoint = '/events/';
        this.filterByCustomer = false;
      },
      setDefaultFilter: function() {
        this.defaultFilter = {exclude_extra: true};
        if (!ENV.featuresVisible) {
          this.defaultFilter.exclude_features = ENV.toBeFeatures;
        }
      },
      getEventGroups: function() {
        var vm = this;
        if (this.eventGroups) {
          return $q.resolve(this.eventGroups);
        } else {
          var url = ENV.apiEndpoint + 'api/events/event_groups/';
          return this.$get(null, url).then(function(eventGroups) {
            delete eventGroups.$promise;
            delete eventGroups.$resolved;
            vm.eventGroups = eventGroups;
            return vm.eventGroups;
          });
        }
      },
      getResourceEvents: function (resource) {
        return this.getList({scope: resource.url}).then(function(response) {
          return response.map(function(event) {
            return {
              name: event.event_type.replace('resource_', '').replace(/_/g, ' '),
              timestamp: event['@timestamp']
            }
          });
        });
      },
      getAvailableIconTypes: function() {
        var icons = [],
          icon,
          descriptions = [],
          description;
        for (var i in EVENT_ICONS_TYPES) {
          if (ENV.toBeFeatures.indexOf(i) === -1 && EVENT_ICONS_TYPES.hasOwnProperty(i)) {
            icon = EVENT_ICONS_TYPES[i][1];
            icon = (icon === 'provider') ? 'service' : icon;
            for (var j in EVENT_TEMPLATES) {
              description = EVENT_TEMPLATES[j].replace(/_/gi, ' ');
              if (j.split('_')[0] === i && EVENT_TEMPLATES.hasOwnProperty(j)
                  && descriptions.indexOf(description) === -1
              ) {
                descriptions.push(description);
              }
            }
            icons.push([icon, EVENT_ICONS_TYPES[i][0], descriptions]);
            descriptions = [];
          }
        }
        return icons;
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
        'invoice_creation_succeeded': 'Invoice for organization {customer_name} for the period of {invoice_date} has been created.',
        'invoice_deletion_succeeded': 'Invoice for organization {customer_name} for the period of {invoice_date} has been deleted.',
        'invoice_update_succeeded': 'Invoice for organization {customer_name} for the period of {invoice_date} has been updated.',
        'payment_approval_succeeded': 'Payment for {customer_name} has been approved',
        'payment_cancel_succeeded': 'Payment for {customer_name} has been cancelled',
        'payment_creation_succeeded': 'Created a new payment for {customer_name}',
        'project_creation_succeeded': 'Project {project_name} has been created.',
        'project_deletion_succeeded': 'Project {project_name} has been deleted.',
        'project_name_update_succeeded': 'Project has been renamed from {project_previous_name} to {project_name}.',
        'project_update_succeeded': 'Project {project_name} has been updated.',
        'quota_threshold_reached': '{quota_name} quota threshold has been reached for project {project_name}.',
        'resource_creation_failed': 'Resource {resource_name} creation has failed.',
        'resource_creation_scheduled': 'Resource {resource_name} creation has been scheduled.',
        'resource_creation_succeeded': 'Resource {resource_name} has been created.',
        'resource_deletion_failed': 'Resource {resource_name} deletion has failed.',
        'resource_deletion_scheduled': 'Resource {resource_name} has been scheduled to deletion.',
        'resource_deletion_succeeded': 'Resource {resource_name} has been deleted.',
        'resource_import_succeeded': 'Resource {resource_name} has been imported.',
        'resource_restart_failed': 'Resource {resource_name} restart has failed.',
        'resource_restart_scheduled': 'Resource {resource_name} has been scheduled to restart.',
        'resource_restart_succeeded': 'Resource {resource_name} has been restarted.',
        'resource_start_failed': 'Resource {resource_name} start has failed.',
        'resource_start_scheduled': 'Resource {resource_name} has been scheduled to start.',
        'resource_start_succeeded': 'Resource {resource_name} has been started.',
        'resource_stop_failed': 'Resource {resource_name} stop has failed.',
        'resource_stop_scheduled': 'Resource {resource_name} has been scheduled to stop.',
        'resource_stop_succeeded': 'Resource {resource_name} has been stopped.',
        'resource_update_succeeded': 'Resource {resource_name} has been updated.',
        'role_granted': 'User {affected_user_full_name} has gained role of {role_name}.',
        'role_revoked': 'User {affected_user_full_name} has revoked role of {role_name}.',
        'service_project_link_creation_failed': 'Creation of service project link {service_name} has failed',
        'ssh_key_creation_succeeded': 'SSH key {ssh_key_name} has been created.',
        'ssh_key_deletion_succeeded': 'SSH key {ssh_key_name} has been deleted.',
        'user_activated': 'User {affected_user_full_name} has been activated.',
        'user_creation_succeeded': 'User {affected_user_full_name} has been created.',
        'user_deactivated': 'User {affected_user_full_name} has been deactivated.',
        'user_deletion_succeeded': 'User {affected_user_full_name} has been deleted.',
        'user_organization_approved': 'User {affected_user_full_name} has been approved for organization {affected_organization}.',
        'user_organization_claimed': 'User {affected_user_full_name} has claimed organization {affected_organization}.',
        'user_organization_rejected': 'User {affected_user_full_name} claim for organization {affected_organization} has been rejected.',
        'user_organization_removed': 'User {affected_user_full_name} has been removed from organization {affected_organization}.',
        'user_password_updated': 'Password has been changed for user {affected_user_full_name}.',
        'user_update_succeeded': 'User {affected_user_full_name} has been updated.'
    };
    angular.module('ncsaas').constant('EVENT_TEMPLATES', templates);

  angular.module('ncsaas').constant('EVENT_ICONS_TYPES', {
    auth: ['Authentication events', 'user'],
    invoice: ['Invoice events', 'customer'],
    user: ['Key management events', 'user'],
    customer: ['Organization events', 'customer'],
    payment: ['Payment events', 'customer'],
    project: ['Project events', 'project'],
    service: ['Providers events', 'service'],
    resource: ['Resource events', 'resource'],
    role: ['Role management events', 'user'],
    quota: ['Quota events', 'customer'],
    ssh: ['SSH key events', 'key'],
    template: ['Template events', 'resource']
  });

  var types = {};
  for (var key in templates) {
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
    'resource': 'resources.details',
    'service': 'organizations.details',
});

angular.module('ncsaas').constant('EVENT_ICONS', {
    'auth_logged_in_with_username': 'user',
    'customer_account_credited': 'customer',
    'customer_account_debited': 'customer',
    'customer_creation_succeeded': 'customer',
    'customer_deletion_succeeded': 'customer',
    'customer_update_succeeded': 'customer',
    'invoice_creation_succeeded': 'customer',
    'invoice_deletion_succeeded': 'customer',
    'invoice_update_succeeded': 'customer',
    'payment_approval_succeeded': 'customer',
    'payment_cancel_succeeded': 'customer',
    'payment_creation_succeeded': 'customer',
    'project_creation_succeeded': 'project',
    'project_deletion_succeeded': 'project',
    'project_name_update_succeeded': 'project',
    'project_update_succeeded': 'project',
    'quota_threshold_reached': 'customer',
    'resource_creation_failed': 'resource',
    'resource_creation_scheduled': 'resource',
    'resource_creation_succeeded': 'resource',
    'resource_deletion_failed': 'resource',
    'resource_deletion_scheduled': 'resource',
    'resource_deletion_succeeded': 'resource',
    'resource_import_succeeded': 'resource',
    'resource_restart_failed': 'resource',
    'resource_restart_scheduled': 'resource',
    'resource_restart_succeeded': 'resource',
    'resource_start_failed': 'resource',
    'resource_start_scheduled': 'resource',
    'resource_start_succeeded': 'resource',
    'resource_stop_failed': 'resource',
    'resource_stop_scheduled': 'resource',
    'resource_stop_succeeded': 'resource',
    'resource_update_succeeded': 'resource',
    'role_granted': 'user',
    'role_revoked': 'user',
    'service_project_link_creation_failed': 'service',
    'service_project_link_sync_failed': 'service',
    'ssh_key_creation_succeeded': 'key',
    'ssh_key_deletion_succeeded': 'key',
    'user_activated': 'user',
    'user_creation_succeeded': 'user',
    'user_deactivated': 'user',
    'user_deletion_succeeded': 'user',
    'user_organization_approved': 'user',
    'user_organization_claimed': 'user',
    'user_organization_rejected': 'user',
    'user_organization_removed': 'user',
    'user_password_updated': 'user',
    'user_update_succeeded': 'user'
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
                if (entity == 'service') {
                    args = {
                        uuid: context.customer_uuid,
                        providerUuid: uuid,
                        providerType: context.service_type,
                        tab: 'providers'
                    }
                }
                if (entity == 'resource') {
                    args.resource_type = context.resource_type;
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
                'invoice_deletion_succeeded',
                'project_deletion_succeeded',
                'project_group_deletion_succeeded',
                'resource_deleted',
                'ssh_key_deletion_succeeded',
                'template_deletion_succeeded',
                'template_service_deletion_succeeded',
                'user_deletion_succeeded'
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
