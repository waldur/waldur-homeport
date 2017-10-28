import { ALERT_ICONS_TYPES, ALERT_TEMPLATES } from './constants';

// @ngInject
export default function alertsService(baseServiceClass, ENV) {
  let ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/alerts/';
    },
    setDefaultFilter: function() {
      // New alerts first
      this.defaultFilter = {
        opened: true,
        o: '-created'
      };
      if (!ENV.featuresVisible) {
        this.defaultFilter.exclude_features = ENV.toBeFeatures;
      }
    },
    getAvailableIconTypes: function() {
      let icons = [],
        icon,
        descriptions = [],
        description;
      for (let i in ALERT_ICONS_TYPES) {
        if (ENV.toBeFeatures.indexOf(i) === -1 && ALERT_ICONS_TYPES.hasOwnProperty(i)) {
          icon = i.slice(0, -1);
          icon = (icon === 'provider') ? 'service' : icon;
          for (let j in ALERT_TEMPLATES) {
            description = ALERT_TEMPLATES[j]
              .replace(/ {\w+}|\./gi, '');
            description.replace('{'+ icon +'_name} ', '');
            if (j.slice(0, icon.length) === icon
              && ALERT_TEMPLATES.hasOwnProperty(j)
              && descriptions.indexOf(description) === -1
            ) {
              descriptions.push(description);
            }
          }
          icons.push([icon, ALERT_ICONS_TYPES[i], descriptions]);
          descriptions = [];
        }
      }
      return icons;
    }

  });
  return new ServiceClass();
}

