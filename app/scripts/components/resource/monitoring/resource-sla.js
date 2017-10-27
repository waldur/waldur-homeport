import template from './resource-sla.html';
import './resource-sla.scss';

const resourceSla = {
  template: template,
  bindings: {
    resource: '<'
  },
  controller: class ResourceSla {
    // @ngInject
    constructor($q, zabbixItservicesService, zabbixHostsService) {
      this.$q = $q;
      this.zabbixItservicesService = zabbixItservicesService;
      this.zabbixHostsService = zabbixHostsService;
    }

    $onInit() {
      this.loadSla();
      this.loadEvents();
    }

    loadSla() {
      if (!this.resource.sla) {
        return;
      }

      var dataSla = [angular.extend(this.resource.sla, {
        date: new Date(this.resource.sla.period)
      })];
      var requests = [];

      var slaEndDate = new Date(this.resource.sla.period);

      for (var i = 1; i < 10; i++) {
        var month = slaEndDate.getMonth() + 1 - i;
        var year = slaEndDate.getFullYear();

        if (month < 1) {
          year -= 1;
          month = 12 + month;
        }

        var request = this.zabbixHostsService.$get(null, this.resource.url, {
          period: year + '-' + (month < 10 ? '0' + month : month ),
          field: 'sla'
        }).then(function(response) {
          response.sla && dataSla.push(angular.extend(response.sla, {
            date: new Date(response.sla.period)
          }));
        });

        requests.push(request);
      }

      this.$q.all(requests).then(() => {
        this.data = dataSla.sort(function(a, b) {
          return a.date.getTime() - b.date.getTime();
        });
      });
    }

    loadEvents() {
      const host = this.findHost(this.resource);
      if (host) {
        this.zabbixHostsService.$get(host.uuid).then(host => {
          const service = this.findService(host);
          if (service) {
            this.loadEventsForService(service);
          }
        });
      }
    }

    loadEventsForService(service) {
      this.zabbixItservicesService.getList({
        UUID: service.uuid,
        operation: 'events'
      }).then(events => {
        this.events = events.map(function(event) {
          event.timestamp = event.timestamp * 1000;
          return event;
        });
      });
    }

    findHost(resource) {
      return resource.related_resources.filter(item =>
        item.resource_type === 'Zabbix.Host')[0];
    }

    findService(host) {
      return host.related_resources.filter(item =>
        item.resource_type === 'Zabbix.ITService')[0];
    }
  }
};

export default resourceSla;
