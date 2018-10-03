import loadSummernote from '@waldur/shims/load-summernote';

import template from './appstore-field-html-text.html';

const appstoreFieldHtmlText = {
  template: template,
  bindings: {
    field: '<',
    model: '=',
    form: '=',
  },
  controller: class appstoreFieldHtmlTextController {
    // @ngInject
    constructor($ocLazyLoad) {
      this.$ocLazyLoad = $ocLazyLoad;
    }
    $onInit() {
      this.loading = true;
      loadSummernote().then(() => {
        this.$ocLazyLoad.load({name: 'summernote'});
        this.options = {
          height: 150,
          toolbar: [
            ['style', ['bold', 'italic', 'underline', 'clear']],
            ['color', ['color']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['height', ['height']]
          ]
        };
        this.loading = false;
      });
    }
  }
};

export default appstoreFieldHtmlText;
