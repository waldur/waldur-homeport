import registerImportTableAction from './register-import-table-action';
import importVolumesService from './import-volumes-service';
import importVolumesList from './import-volumes-list';

export default module => {
  module.service('importVolumesService', importVolumesService);
  module.component('importVolumesList', importVolumesList);
  module.run(registerImportTableAction);
};
