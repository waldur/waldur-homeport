import { titleCase } from '@waldur/core/utils';

export const formatEventTitle = choice => {
  const map = {
    ssh: 'SSH',
    jira: 'JIRA',
    vms: 'Resources',
    customers: 'Organizations',
  };
  if (map[choice]) {
    choice = map[choice];
  } else {
    choice = titleCase(choice.replace('_', ' '));
  }
  return choice + ' events';
};
