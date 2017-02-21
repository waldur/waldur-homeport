// @ngInject
export default function estonianIdLogout(ENV, $rootScope) {
  $rootScope.$on('logoutStart', function() {
    const popup = $('<iframe></iframe>');
    popup.hide();
    popup.attr('src', ENV.estoniaIdLogoutUrl);
    popup.on('load', function() {
      $(this).remove();
    });
    $('body').append(popup);
  });
}
