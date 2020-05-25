import './node/module';
import './provider';
import clusterModule from './cluster/module';
import rancherRoutes from './routes';

export default module => {
  module.config(rancherRoutes);
  clusterModule();
};
