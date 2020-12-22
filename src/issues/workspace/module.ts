import { attachStateUtils } from './attachStateUtils';

export default (module) => {
  module.run(attachStateUtils);
};
