import { StateUtilsService, attachStateUtils } from './utils';
import './events';

export default (module) => {
  module.service('StateUtilsService', StateUtilsService);
  module.run(attachStateUtils);
};
