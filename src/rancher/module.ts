import './node/module';
import './provider';
import catalogModule from './catalog/module';
import clusterModule from './cluster/module';
import rancherRoutes from './routes';

export default module => {
  module.config(rancherRoutes);
  clusterModule(module);
  catalogModule(module);
};
