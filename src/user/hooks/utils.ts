import { eventsEventGroupsRetrieve } from 'waldur-js-client';

import { titleCase } from '@/core/utils';

import { EVENT_GROUP_LABELS, EVENT_GROUP_SECTIONS } from './eventGroupLabels';
import { EventGroupOption } from './types';

// Used only for a group the label map does not know yet, so an older or
// newer backend still renders something readable.
const formatDerivedEventTitle = (choice) => {
  const map = {
    ssh: 'SSH',
    jira: 'JIRA',
    vms: 'Resources',
    customers: 'Organizations',
    // Without this the derived label reads "Openstack resources", while the
    // event filters name the same group "OpenStack resource".
    openstack_resources: 'OpenStack resource',
  };
  if (map[choice]) {
    choice = map[choice];
  } else {
    choice = titleCase(choice.replace('_', ' '));
  }
  return choice + ' events';
};

export const formatEventTitle = (choice) =>
  EVENT_GROUP_LABELS[choice]?.title() ?? formatDerivedEventTitle(choice);

const SECTION_ORDER = Object.keys(EVENT_GROUP_SECTIONS);

export const loadEventGroupsOptions: () => Promise<
  EventGroupOption[]
> = async () => {
  const groups = await eventsEventGroupsRetrieve().then(
    (response) => response.data,
  );
  return Object.keys(groups)
    .map((key) => {
      const label = EVENT_GROUP_LABELS[key];
      return {
        key,
        title: formatEventTitle(key),
        description: label?.description(),
        section: label?.section,
      };
    })
    .sort((a, b) => {
      // Unknown groups sort after every known section.
      const sa = a.section ? SECTION_ORDER.indexOf(a.section) : Infinity;
      const sb = b.section ? SECTION_ORDER.indexOf(b.section) : Infinity;
      return sa - sb || a.title.localeCompare(b.title);
    });
};
