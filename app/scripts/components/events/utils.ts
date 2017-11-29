import { ENV } from '@waldur/core/services';
import { EventGroup } from './types';
import { EVENT_ICONS_TYPES, EVENT_TEMPLATES } from './constants';

export function getAvailableEventGroups(): EventGroup[] {
  let eventGroups: EventGroup[] = [];
  for (let iconType in EVENT_ICONS_TYPES) {
    if (ENV.toBeFeatures.indexOf(iconType) === -1 && EVENT_ICONS_TYPES.hasOwnProperty(iconType)) {
      let icon = EVENT_ICONS_TYPES[iconType].imageId;
      icon = (icon === 'provider') ? 'service' : icon;

      const descriptions = [];
      for (const template in EVENT_TEMPLATES) {
        const description = EVENT_TEMPLATES[template].replace(/_/gi, ' ');
        if (template.split('_')[0] === iconType && EVENT_TEMPLATES.hasOwnProperty(template)
            && descriptions.indexOf(description) === -1
        ) {
          descriptions.push(description);
        }
      }
      eventGroups.push({
        icon,
        name: EVENT_ICONS_TYPES[iconType].text,
        descriptions
      });
    }
  }
  return eventGroups;
}
