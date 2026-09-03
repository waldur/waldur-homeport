import { eventsEventGroupsRetrieve } from 'waldur-js-client';

import { titleCase } from '@/core/utils';

import { EventGroupOption } from './types';

export const formatEventTitle = (choice) => {
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

export const loadEventGroupsOptions: () => Promise<
  EventGroupOption[]
> = async () => {
  const groups = await eventsEventGroupsRetrieve().then(
    (response) => response.data,
  );
  const options = Object.keys(groups)
    .map((key) => ({
      key,
      title: formatEventTitle(key),
      help_text: groups[key].join(', '),
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
  return options;
};
