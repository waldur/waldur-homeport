import featuresProvider from './provider';
import visibleIf from './visibleIf';

export default module => {
  module.provider('features', featuresProvider);
  module.directive('visibleIf', visibleIf);
};
