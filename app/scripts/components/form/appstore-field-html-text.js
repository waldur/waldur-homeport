import template from './appstore-field-html-text.html';

const appstoreFieldHtmlText = {
  template: template,
  bindings: {
    field: '<',
    model: '=',
    form: '=',
  },
  controller: class appstoreFieldHtmlTextController {
    $onInit() {
      this.options = {
        height: 150,
        toolbar: [
          ['style', ['bold', 'italic', 'underline', 'clear']],
          ['color', ['color']],
          ['para', ['ul', 'ol', 'paragraph']],
          ['height', ['height']]
        ]
      };
    }
  }
};

export default appstoreFieldHtmlText;
