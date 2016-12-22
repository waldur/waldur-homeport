import './longread.scss';

export default function() {
  return {
    restrict: 'E',
    controller: function() {
      const lines = this.text.split('\n').join('</p><p>');
      this.formatted = `<p>${lines}</p>`;
    },
    controllerAs: '$ctrl',
    scope: {},
    bindToController: {
      text: '='
    },
    template: '<div class="longread" ng-bind-html="$ctrl.formatted"></div>'
  };
}
