import template from './docs-link.html';

// @ngInject
function docsLinkController(ENV) {
  this.link = ENV.docsLink;
}

export default function docsLink() {
  return {
    template: template,
    replace: true,
    scope: {},
    controllerAs: '$ctrl',
    controller: docsLinkController,
  };
}
