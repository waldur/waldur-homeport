import { baseControllerClass, baseControllerAddClass } from './base-controller-class';

export default module => {
  module.service('baseControllerClass', baseControllerClass);
  module.service('baseControllerAddClass', baseControllerAddClass);
};
