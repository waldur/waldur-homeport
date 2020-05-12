import monitoringCreateDialog from './ZabbixHostCreateDialog';
import monitoringDetailsDialog from './ZabbixHostDetailsDialog';

export default module => {
  module.component('monitoringDetailsDialog', monitoringDetailsDialog);
  module.component('monitoringCreateDialog', monitoringCreateDialog);
};
