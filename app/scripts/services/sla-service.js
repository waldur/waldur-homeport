'use strict';

(function() {
    angular.module('ncsaas')
        .service('slaService', ['baseServiceClass', slaService]);

    function slaService(baseServiceClass) {
        /*jshint validthis: true */
        var ServiceClass = baseServiceClass.extend({
            init:function() {
                this._super();
                this.endpoint = '';
            },
            getList: function() {

            },
            getGraphList: function() {
                var data = [];
                for (var i = 0; i <= 10; i++) {
                    data.push({
                        date: new Date(2011, i, 1),
                        value: i * 10
                    });
                }
                return data;
            },
            getEventsList: function() {
                return [
                    {
                        "timestamp": 1418043540,
                        "state": "U"
                    },
                    {
                        "timestamp": 1417928550,
                        "state": "D"
                    },
                    {
                        "timestamp": 1417928490,
                        "state": "U"
                    }
                ];
            }
        });
        return new ServiceClass();
    }

})();
