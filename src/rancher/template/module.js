import rancherCatalogTemplateList from './CatalogTemplateList';
import rancherTemplateDetails from './TemplateDetail';

export default module => {
  module.component('rancherTemplateDetails', rancherTemplateDetails);
  module.component('rancherCatalogTemplateList', rancherCatalogTemplateList);
};
