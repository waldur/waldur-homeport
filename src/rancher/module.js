import './provider';
import catalogModule from './catalog/module';
import clusterModule from './cluster/module';
import nodeModule from './node/module';
import rancherRoutes from './routes';

export default module => {
  module.config(rancherRoutes);
  clusterModule(module);
  nodeModule(module);
  catalogModule(module);
};
