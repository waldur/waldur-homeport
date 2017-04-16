import template from './docs-link.html';

export default function docsLink() {
  return {
    template: template,
    replace: true,
    scope: {},
    controllerAs: '$ctrl',
    controller: function(ENV) {
      // @ngInject
      this.link = ENV.docsLink;
    }
  };
}
