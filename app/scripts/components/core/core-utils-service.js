// @ngInject
export default function coreUtils($filter) {
  return {
    templateFormatter: function(template, params) {
      let formattedString = template.replace(/{(.+?)}/g, function(match, key) {
        return params[key];
      }
      );
      return $filter('translate')(formattedString);
    }
  };
}
