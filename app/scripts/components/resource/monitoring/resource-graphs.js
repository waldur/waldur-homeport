import template from './resource-graphs.html';
import './resource-graphs.scss';

const resourceGraphs = {
  template: template,
  bindings: {
    resource: '<'
  },
  controller: class ResourceGraphs {
    constructor(zabbixHostsService) {
      this.zabbixHostsService = zabbixHostsService;
    }

    $onInit() {
      this.noGraphsData = false;
      const host = this.findHost(this.resource.related_resources);
      if (host) {
        this.loadGraphs(host.uuid);
      } else {
        this.cpuGraphError = gettext('Not enough data for chart.');
        this.ramGraphError = gettext('Not enough data for chart.');
      }
    }

    findHost(resources) {
      for (var i = 0; i < resources.length; i++) {
        if (resources[i].resource_type === 'Zabbix.Host') {
          return resources[i];
        }
      }
    }

    loadGraphs(uuid) {
      const startDate = Math.floor(new Date().getTime() / 1000 - (24 * 3600));
      const endDate = Math.floor(new Date().getTime() / 1000);

      const query = {
        UUID: uuid,
        operation: 'items_history',
        start: startDate,
        end: endDate,
        points_count: 5
      };
      this.loadCpuChart(query);
      this.loadRamChart(query);
    }

    loadCpuChart(query) {
      const chartQuery = angular.extend({}, query, {
        item: 'proc.num[,,run]'
      });
      return this.zabbixHostsService.getList(chartQuery)
          .then(items => this.parseData(items))
          .then(data => this.cpuGraphData = data)
          .catch(() => this.cpuGraphError = gettext('Chart is not available at this moment.'));
    }

    loadRamChart(query) {
      const chartQuery = angular.extend({}, query, {
        item: 'vm.memory.size[available]'
      });

      return this.zabbixHostsService.getList(chartQuery)
          .then(items => this.parseData(items))
          .then(data => this.ramGraphData = data)
          .catch(() => this.ramGraphError = gettext('Chart is not available at this moment.'));
    }

    parseData(items) {
      return items.map(item => ({
        core1: item.value,
        date: new Date(item.point * 1000)
      }));
    }
  }
};

export default resourceGraphs;
