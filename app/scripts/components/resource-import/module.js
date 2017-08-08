import ImportUtils from './utils';
import resourceImportDialog from './resource-import-dialog';

export default module => {
  module.component('resourceImportDialog', resourceImportDialog);
  module.service('ImportUtils', ImportUtils);
};
