// @ngInject
export default function invoicesService(baseServiceClass, $http, ENV, $state) {
  var ServiceClass = baseServiceClass.extend({
    init:function() {
      this._super();
      this.endpoint = '/invoices/';
    },
    sendNotification: function(invoice_uuid) {
      var url = ENV.apiEndpoint + 'api' + this.endpoint + invoice_uuid + '/send_notification/';
      return $http.post(url, {link_template: this.getTemplateUrl()});
    },
    getTemplateUrl: function() {
      var path = $state.href('billingDetails', {invoiceUUID: 'TEMPLATE'});
      return location.origin + path.replace('TEMPLATE', '{uuid}');
    }
  });
  return new ServiceClass();
}
