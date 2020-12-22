import { init } from './utils';

export default (module) => {
  module.run(() => {
    init();
  });
};
