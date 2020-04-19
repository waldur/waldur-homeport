import template from './user-selector.html';

export default function userSelector() {
  return {
    restrict: 'E',
    scope: {
      users: '=',
      model: '=',
    },
    template: template,
  };
}
