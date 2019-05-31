// @ngInject
export default function invoicesService(baseServiceClass, $http, ENV) {
  let ServiceClass = baseServiceClass.extend({
    init:function() {
      this._super();
      this.endpoint = '/invoices/';
    },
    sendNotification: function(invoice_uuid) {
      let url = ENV.apiEndpoint + 'api' + this.endpoint + invoice_uuid + '/send_notification/';
      return $http.post(url);
    },
  });
  return new ServiceClass();
}
