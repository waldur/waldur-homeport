import featuresProvider from './provider';

export default (module) => {
  module.provider('features', featuresProvider);
};
