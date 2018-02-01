import monitoringCreateDialog from './ZabbixHostCreateDialog';
import monitoringDetailsDialog from './ZabbixHostDetailsDialog';
import multiLineChart from './multi-line-chart';
import verticalBarChart from './vertical-bar-chart';
import resourceGraphs from './resource-graphs';
import resourceSla from './resource-sla';
import zabbixHostsService from './zabbix-hosts-service';
import zabbixItservicesService from './zabbix-itservices-service';

export default module => {
  module.component('monitoringDetailsDialog', monitoringDetailsDialog);
  module.component('monitoringCreateDialog', monitoringCreateDialog);
  module.directive('multiLineChart', multiLineChart);
  module.directive('verticalBarChart', verticalBarChart);
  module.component('resourceGraphs', resourceGraphs);
  module.component('resourceSla', resourceSla);
  module.service('zabbixHostsService', zabbixHostsService);
  module.service('zabbixItservicesService', zabbixItservicesService);
};
