import featuresProvider from './provider';
import visible from './visible';
import visibleIf from './visibleIf';

export default module => {
  module.provider('features', featuresProvider);
  module.directive('visible', visible);
  module.directive('visibleIf', visibleIf);
};
