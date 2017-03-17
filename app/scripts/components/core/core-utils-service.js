// @ngInject
export default function coreUtils() {
  return {
    templateFormatter: function(template, params) {
      return template.replace(/{(.+?)}/g, function(match, contents)
        {
          return params[contents];
        }
      );
    }
  };
}
