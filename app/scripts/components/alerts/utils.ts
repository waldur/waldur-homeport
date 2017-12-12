import { ENV } from '@waldur/core/services';
import { EventGroup } from '@waldur/events/types';

import { ALERT_ICONS_TYPES, ALERT_TEMPLATES } from './constants';

export function getAvailableEventGroups(): EventGroup[] {
  const eventGroups: EventGroup[] = [];
  for (const iconType in ALERT_ICONS_TYPES) {
    if (ALERT_ICONS_TYPES.hasOwnProperty(iconType) && ENV.toBeFeatures.indexOf(iconType) === -1) {
      let icon = iconType.slice(0, -1);
      icon = (icon === 'provider') ? 'service' : icon;

      const descriptions = [];

      for (const template in ALERT_TEMPLATES) {
        if (ALERT_TEMPLATES.hasOwnProperty(template)) {
          const description = ALERT_TEMPLATES[template]
            .replace(/ {\w+}|\./gi, '');
          if (template.slice(0, icon.length) === icon
            && descriptions.indexOf(description) === -1
          ) {
            descriptions.push(description);
          }
        }
      }
      eventGroups.push({
        icon,
        name: ALERT_ICONS_TYPES[iconType],
        descriptions,
      });
    }
  }
  return eventGroups;
}
