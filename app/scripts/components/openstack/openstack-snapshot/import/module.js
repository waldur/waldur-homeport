import registerImportTableAction from './register-import-table-action';
import importSnapshotsService from './import-snapshots-service';
import importSnapshotsList from './import-snapshots-list';

export default module => {
  module.service('importSnapshotsService', importSnapshotsService);
  module.component('importSnapshotsList', importSnapshotsList);
  module.run(registerImportTableAction);
};
