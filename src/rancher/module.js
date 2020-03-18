import './provider';
import catalogModule from './catalog/module';
import clusterModule from './cluster/module';
import rancherClusterProjects from './ClusterProjectList';
import nodeModule from './node/module';
import rancherRoutes from './routes';
import templateModule from './template/module';

export default module => {
  module.component('rancherClusterProjects', rancherClusterProjects);
  module.config(rancherRoutes);
  clusterModule(module);
  nodeModule(module);
  templateModule(module);
  catalogModule(module);
};
