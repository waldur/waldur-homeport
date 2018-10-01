import { attachHooks } from './hooks';
import { loadProject } from './utils';

export default module => {
  module.run(attachHooks);
  module.run(loadProject);
};
