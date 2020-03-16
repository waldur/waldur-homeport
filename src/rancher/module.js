import * as ResourceSummary from '@waldur/resource/summary/registry';

import breadcrumbsConfig from './breadcrumbs';
import rancherCatalogCreateDialog from './CatalogCreateDialog';
import rancherCatalogDeleteDialog from './CatalogDeleteDialog';
import rancherCatalogTemplateList from './CatalogTemplateList';
import clusterActions from './cluster-actions';
import rancherCreateNodeDialog from './cluster-actions/CreateNodeDialog';
import RancherClusterKubeconfigDialog from './cluster-actions/RancherClusterKubeconfigDialog';
import rancherClusterCatalogs from './ClusterCatalogList';
import rancherClusterProjects from './ClusterProjectList';
import rancherClusterTemplates from './ClusterTemplateList';
import nodeActions from './node-actions';
import './marketplace';
import './provider';
import rancherClusterNodes from './rancher-cluster-nodes';
import rancherNodesService from './rancher-nodes-service';
import { RancherClusterSummary } from './RancherClusterSummary';
import rancherKeyValueDialog from './RancherKeyValueDialog';
import { RancherNodeSummary } from './RancherNodeSummary';
import rancherRoutes from './routes';
import { tabsConfig } from './tabs';
import rancherTemplateDetails from './TemplateDetail';

// @ngInject
function actionsConfig(ActionConfigurationProvider) {
  ActionConfigurationProvider.register('Rancher.Node', nodeActions);
  ActionConfigurationProvider.register('Rancher.Cluster', clusterActions);
}

export default module => {
  ResourceSummary.register('Rancher.Cluster', RancherClusterSummary);
  ResourceSummary.register('Rancher.Node', RancherNodeSummary);
  module.service('rancherNodesService', rancherNodesService);
  module.component('rancherCatalogTemplateList', rancherCatalogTemplateList);
  module.component('rancherClusterNodes', rancherClusterNodes);
  module.component('rancherClusterCatalogs', rancherClusterCatalogs);
  module.component('rancherClusterProjects', rancherClusterProjects);
  module.component('rancherClusterTemplates', rancherClusterTemplates);
  module.component(
    'rancherClusterKubeconfigDialog',
    RancherClusterKubeconfigDialog,
  );
  module.component('rancherKeyValueDialog', rancherKeyValueDialog);
  module.component('rancherCreateNodeDialog', rancherCreateNodeDialog);
  module.component('rancherCatalogCreateDialog', rancherCatalogCreateDialog);
  module.component('rancherCatalogDeleteDialog', rancherCatalogDeleteDialog);
  module.component('rancherTemplateDetails', rancherTemplateDetails);
  module.config(actionsConfig);
  module.config(tabsConfig);
  module.config(rancherRoutes);
  module.run(breadcrumbsConfig);
};
