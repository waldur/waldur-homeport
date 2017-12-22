import injectServices from './services';

export default module => {
  module.run(injectServices);
};
