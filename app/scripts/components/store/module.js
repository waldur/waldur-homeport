import { attachHooks } from './hooks';

export default module => {
  module.run(attachHooks);
};
