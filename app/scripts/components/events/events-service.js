import { EVENT_ICONS_TYPES, EVENT_TEMPLATES } from './constants';

// @ngInject
export default function eventsService($q, baseServiceClass, ENV) {
  let ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/events/';
    },
    setDefaultFilter: function() {
      this.defaultFilter = {exclude_extra: true};
    },
    getEventGroups: function() {
      let vm = this;
      if (this.eventGroups) {
        return $q.resolve(this.eventGroups);
      } else {
        let url = ENV.apiEndpoint + 'api/events/event_groups/';
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
          };
        });
      });
    },
    getAvailableIconTypes: function() {
      let icons = [],
        icon,
        descriptions = [],
        description;
      for (let i in EVENT_ICONS_TYPES) {
        if (ENV.toBeFeatures.indexOf(i) === -1 && EVENT_ICONS_TYPES.hasOwnProperty(i)) {
          icon = EVENT_ICONS_TYPES[i][1];
          icon = (icon === 'provider') ? 'service' : icon;
          for (let j in EVENT_TEMPLATES) {
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
