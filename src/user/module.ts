import { attachStateUtils } from './utils';
import './events';

export default (module) => {
  module.run(attachStateUtils);
};
