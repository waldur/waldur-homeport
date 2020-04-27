import rancherCatalogCreateDialog from './CatalogCreateDialog';
import rancherCatalogDeleteDialog from './CatalogDeleteDialog';

export default module => {
  module.component('rancherCatalogCreateDialog', rancherCatalogCreateDialog);
  module.component('rancherCatalogDeleteDialog', rancherCatalogDeleteDialog);
};
