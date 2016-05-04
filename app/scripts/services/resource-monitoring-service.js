'use strict';

(function() {
    angular.module('ncsaas')
        .service('resourceMonitoringService', ['baseServiceClass', resourceMonitoringService]);

    function resourceMonitoringService(baseServiceClass) {
        /*jshint validthis: true */
        var ServiceClass = baseServiceClass.extend({
            init:function() {
                this._super();
                this.endpoint = '';
                this.filterByCustomer = false;
            },
            getList: function() {

            },
            getCPUData: function() {
                var data = [],
                    counter = 0,
                    date = new Date();
                for (var i=0; i<100; i++) {
                    data.push({
                        core1: Math.random() * 2,
                        core2: Math.random() * 2,
                        date: new Date(date.getTime() + counter * 60000)
                    });
                    counter++;
                }
                return data;
            },
            getHDDData: function() {
                var data = [],
                    counter = 0,
                    date = new Date();
                for (var i=0; i<100; i++) {
                    data.push({
                        hdd: Math.random() * 2,
                        date: new Date(date.getTime() + counter * 60000)
                    });
                    counter++;
                }
                return data;
            }
        });
        return new ServiceClass();
    }

})();