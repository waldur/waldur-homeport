// @ngInject
export default function formatEventTitle($filter) {
  return function(choice) {
    var map = {
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
