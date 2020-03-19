import rancherCatalogCreateDialog from './CatalogCreateDialog';
import rancherCatalogDeleteDialog from './CatalogDeleteDialog';
import rancherClusterCatalogs from './ClusterCatalogList';

export default module => {
  module.component('rancherClusterCatalogs', rancherClusterCatalogs);
  module.component('rancherCatalogCreateDialog', rancherCatalogCreateDialog);
  module.component('rancherCatalogDeleteDialog', rancherCatalogDeleteDialog);
};
