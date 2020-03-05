// @ngInject
export function ncUtilsFlash(Flash, $rootScope, ErrorMessageFormatter) {
  let dismiss = Flash.dismiss;
  Flash.dismiss = function() {
    // for hasFlash variable change emit for ng-show directive in flash block
    $rootScope.hasFlash = !$rootScope.hasFlash;
    dismiss();
  };
  return {
    success: function(message) {
      this.flashMessage('success', message);
    },
    error: function(message) {
      this.flashMessage('danger', message);
    },
    info: function(message) {
      this.flashMessage('info', message);
    },
    warning: function(message) {
      this.flashMessage('warning', message);
    },
    flashMessage: function(type, message) {
      if (message) {
        Flash.create(type, message);
      }
    },
    errorFromResponse: function(response, message) {
      const details = ErrorMessageFormatter.format(response);
      const errorMessage = `${message}. ${details}`;
      this.error(errorMessage);
    },
  };
}
