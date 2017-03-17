// @ngInject
export default function coreUtils() {
  return {
    templateFormatter: function(template, params) {
      for (let i in params) {
        if (params.hasOwnProperty(i)) {
          template = template.replace(`{${i}}`, params[i]);
        }
      }
      return template;
    }
  };
}
