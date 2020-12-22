import { protectStates, urlRouterProvider } from './app';
import loadInspinia from './inspinia';

export default (module) => {
  module.run(loadInspinia);
  module.run(protectStates);
  module.config(urlRouterProvider);
};
