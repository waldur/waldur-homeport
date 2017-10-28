import { EVENT_TEMPLATES, DELETION_EVENTS } from './constants';

// @ngInject
export default function eventFormatter(ENV, BaseEventFormatter) {
  let cls = BaseEventFormatter.extend({
    getTemplate: function(event) {
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
        if (ENV.toBeFeatures.indexOf(part) != -1) {
          return false;
        }
      }
      return true;
    }
  });
  return new cls();
}
