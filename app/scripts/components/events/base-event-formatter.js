import { EVENT_ROUTES } from './constants';

// @ngInject
export default function BaseEventFormatter($state) {
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
        for (let field in entities) {
          var entity = entities[field];
          var url = this.formatUrl(entity, eventContext);
          if (url) {
            templateContext[field] = '<a href="' + url + '" class="name">' + eventContext[field] + '</a>';
          }
        }
      }

      // Fill other fields
      for (var i = 0; i < fields.length; i++) {
        let field = fields[i];
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
    /* eslint-disable no-unused-vars */
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
    /* eslint-enable no-unused-vars */
    formatUrl: function(entity, context) {
      var route = EVENT_ROUTES[entity];
      if (!this.routeEnabled(route)) {
        return;
      }
      var uuid = context[entity + '_uuid'];
      var args = {uuid: uuid};
      if (entity == 'service') {
        route = 'organization.providers';
        args = {
          uuid: context.customer_uuid,
          providerUuid: uuid,
          providerType: context.service_type
        };
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
          let name = key.replace(/_uuid$/, '');
          entities[name] = true;
        }
      }

      var table = {};
      for (let name in entities) {
        for (var i = 0; i < fields.length; i++) {
          var field = fields[i];
          if (field.lastIndexOf(name) === 0 && !table[field]) {
            table[field] = name;
          }
        }
      }
      return table;
    },
    renderTemplate: function(template, params) {
      for (var key in params) {
        template = template.replace('{' + key + '}', params[key]);
      }
      return template;
    }
  });
}
