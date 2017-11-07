import { EVENT_TEMPLATES, DELETION_EVENTS } from './constants';

// @ngInject
export default function eventFormatter(ENV, BaseEventFormatter) {
  let cls = BaseEventFormatter.extend({
    getTemplate: function(event) {
      // Special cases are handled separately
      if (event.event_type === 'role_granted' && event.structure_type === 'customer' && event.role_name === 'Owner') {
        return gettext('User {user_username} has granted organization owner role in {customer_name} to {affected_user_username}.');
      } else if (event.event_type === 'role_granted' && event.structure_type === 'customer' && event.role_name === 'Support') {
        return gettext('User {user_username} has granted organization support role in {customer_name} to {affected_user_username}.');
      } else if (event.event_type === 'role_granted' && event.structure_type === 'project' && event.role_name === 'Administrator') {
        return gettext('User {user_username} has granted project administrator role in project {project_name} to {affected_user_username}.');
      } else if (event.event_type === 'role_granted' && event.structure_type === 'project' && event.role_name === 'Manager') {
        return gettext('User {user_username} has granted project manager role in project {project_name} to {affected_user_username}.');
      } else if (event.event_type === 'role_revoked' && event.structure_type === 'customer' && event.role_name === 'Owner') {
        return gettext('User {user_username} has revoked organization owner {affected_user_username} from {customer_name}.');
      } else if (event.event_type === 'role_revoked' && event.structure_type === 'customer' && event.role_name === 'Support') {
        return gettext('User {user_username} has revoked organization support {affected_user_username} from {customer_name}.');
      } else if (event.event_type === 'role_revoked' && event.structure_type === 'project' && event.role_name === 'Administrator') {
        return gettext('User {user_username} has revoked project administrator {affected_user_username} from project {project_name}.');
      } else if (event.event_type === 'role_revoked' && event.structure_type === 'project' && event.role_name === 'Manager') {
        return gettext('User {user_username} has revoked project manager {affected_user_username} from project {project_name}.');
      }

      return EVENT_TEMPLATES[event.event_type];
    },
    getEventContext: function(event) {
      return event;
    },
    showLinks: function(context) {
      // Don't show links for deletion events
      return DELETION_EVENTS.indexOf(context.event_type) === -1;
    },
    routeEnabled: function(route) {
      if (!route) {
        return false;
      }
      if (ENV.featuresVisible) {
        return true;
      }
      let parts = route.split('.');
      for (let i = 0; i < parts.length; i++) {
        let part = parts[i];
        if (ENV.toBeFeatures.indexOf(part) !== -1) {
          return false;
        }
      }
      return true;
    }
  });
  return new cls();
}
