import monitoringCreateDialog from './ZabbixHostCreateDialog';
import monitoringDetailsDialog from './ZabbixHostDetailsDialog';
import zabbixHostsService from './zabbix-hosts-service';
import zabbixItservicesService from './zabbix-itservices-service';

export default module => {
  module.component('monitoringDetailsDialog', monitoringDetailsDialog);
  module.component('monitoringCreateDialog', monitoringCreateDialog);
  module.service('zabbixHostsService', zabbixHostsService);
  module.service('zabbixItservicesService', zabbixItservicesService);
};
