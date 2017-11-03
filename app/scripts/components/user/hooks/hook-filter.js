// @ngInject
export default function formatEventTitle($filter) {
  return function(choice) {
    let map = {
      ssh: 'SSH',
      jira: 'JIRA',
      vms: 'Resources',
      customers: 'Organizations'
    };
    if (map[choice]) {
      choice = map[choice];
    } else {
      choice = $filter('titleCase')(choice.replace('_', ' '));
    }
    return choice + ' events';
  };
}
