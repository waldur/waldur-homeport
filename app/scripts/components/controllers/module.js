import { baseControllerClass, baseControllerAddClass } from './base-controller-class';
import ImportResourceController from './import-resource-controller';

export default module => {
  module.service('baseControllerClass', baseControllerClass);
  module.service('baseControllerAddClass', baseControllerAddClass);
  module.controller('ImportResourceController', ImportResourceController);
};
