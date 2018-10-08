import template from './multiple-select.html';

export default function multipleSelect() {
  return {
    template: template,
    restrict: 'A',
    scope: {
      choices: '='
    },
  };
}
