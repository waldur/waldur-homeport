'use strict';

(function() {
    angular.module('ncsaas')
        .service('invoicesService', ['baseServiceClass', invoicesService]);

    function invoicesService(baseServiceClass) {
        /*jshint validthis: true */
        var ServiceClass = baseServiceClass.extend({
            init:function() {
                this._super();
                this.endpoint = '/invoices/';
            }
        });
        return new ServiceClass();
    }

})();
