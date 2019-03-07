// @ngInject
export default function estonianIdLogout(ENV, $rootScope) {
  if (!ENV.plugins.WALDUR_CORE.AUTHENTICATION_METHODS.includes('ESTONIAN_ID')) {
    return;
  }
  $rootScope.$on('logoutStart', function() {
    const popup = $('<iframe></iframe>');
    popup.hide();
    popup.attr('src', ENV.plugins.WALDUR_AUTH_OPENID.LOGOUT_URL);
    popup.on('load', function() {
      $(this).remove();
    });
    $('body').append(popup);
  });
}
