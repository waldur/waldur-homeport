// @ngInject
export default function invoicesService(baseServiceClass, $http, ENV, $state) {
  let ServiceClass = baseServiceClass.extend({
    init:function() {
      this._super();
      this.endpoint = '/invoices/';
    },
    sendNotification: function(invoice_uuid) {
      let url = ENV.apiEndpoint + 'api' + this.endpoint + invoice_uuid + '/send_notification/';
      return $http.post(url, {link_template: this.getTemplateUrl()});
    },
    getTemplateUrl: function() {
      let path = $state.href('billingDetails', {uuid: 'TEMPLATE'});
      return location.origin + '/' + path.replace('TEMPLATE', '{uuid}');
    }
  });
  return new ServiceClass();
}
