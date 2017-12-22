import { ENV } from '@waldur/core/services';

import { EVENT_ICONS_TYPES, EVENT_TEMPLATES } from './constants';
import { EventGroup } from './types';

export function getAvailableEventGroups(): EventGroup[] {
  const eventGroups: EventGroup[] = [];
  for (const iconType in EVENT_ICONS_TYPES) {
    if (EVENT_ICONS_TYPES.hasOwnProperty(iconType) && ENV.toBeFeatures.indexOf(iconType) === -1) {
      let icon = EVENT_ICONS_TYPES[iconType].imageId;
      icon = (icon === 'provider') ? 'service' : icon;

      const descriptions = [];
      for (const template in EVENT_TEMPLATES) {
        if (EVENT_TEMPLATES.hasOwnProperty(template)) {
          const description = EVENT_TEMPLATES[template].replace(/_/gi, ' ');
          if (template.split('_')[0] === iconType
              && descriptions.indexOf(description) === -1
          ) {
            descriptions.push(description);
          }
        }
      }
      eventGroups.push({
        icon,
        name: EVENT_ICONS_TYPES[iconType].text,
        descriptions,
      });
    }
  }
  return eventGroups;
}
