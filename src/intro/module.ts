import BaseIntro from './base-intro';
import configureIntroJS from './configure-introjs';
import './intro-custom.scss';
import registerExtensionPoint from './extend-select-workspace-dialog';
import ncIntroUtils from './intro-utils';

export default module => {
  module.service('BaseIntro', BaseIntro);
  module.service('ncIntroUtils', ncIntroUtils);
  module.run(configureIntroJS);
  module.run(registerExtensionPoint);
};
