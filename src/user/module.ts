import { stateUtilsService, attachStateUtils } from './utils';
import './events';

export default module => {
  module.service('stateUtilsService', stateUtilsService);
  module.run(attachStateUtils);
};
