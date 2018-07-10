export default class Saml2Service {
  // @ngInject
  constructor(ENV, $http, $window, ncUtilsFlash) {
    this.endpoint = `${ENV.apiEndpoint}api-auth/saml2/`;
    this.$http = $http;
    this.$window = $window;
    this.ncUtilsFlash = ncUtilsFlash;
  }

  login(provider) {
    /* We support only 2 SAML2 bindings: HTTP redirect and HTTP POST.
     * If HTTP redirect binding is used, we're redirecting user
     * to the URL specified by url field.
     * If HTTP POST binding is used, we're submitting form with
     * SAMLRequest field to URL specified by url field.
     */
    this.$http.post(`${this.endpoint}login/`, {idp: provider}).then(response => {
      const { data } = response;
      if (data.binding === 'redirect') {
        this.$window.location.href = response.data.url;
      } else if (data.binding === 'post') {
        const form = $('<form><input type="hidden" name="SAMLRequest"></input></form>');
        form.attr('action', data.url);
        form.attr('method', 'POST');
        form.find('input').attr('value', data.request);
        $('body').append(form);
        form.submit();
      }
    }).catch(response => {
      if (response.status === 400) {
        this.ncUtilsFlash.error(response.data.error_message);
      } else {
        this.ncUtilsFlash.error(gettext('Unable to login via SAML2 protocol.'));
      }
    });
  }

  getProviders(name) {
    let url = `${this.endpoint}providers/`;
    let params = {};
    if (name) {
      params.name = name;
    }
    return this.$http.get(url, {params});
  }
}
