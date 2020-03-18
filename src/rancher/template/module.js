import rancherCatalogTemplateList from './CatalogTemplateList';
import rancherClusterTemplates from './ClusterTemplateList';
import rancherTemplateDetails from './TemplateDetail';

export default module => {
  module.component('rancherTemplateDetails', rancherTemplateDetails);
  module.component('rancherCatalogTemplateList', rancherCatalogTemplateList);
  module.component('rancherClusterTemplates', rancherClusterTemplates);
};
