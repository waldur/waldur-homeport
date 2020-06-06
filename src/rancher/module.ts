import './node/module';
import './provider';
import clusterModule from './cluster/module';

export default () => {
  clusterModule();
};
