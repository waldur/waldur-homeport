import ncIntroUtils from './intro-utils';
import ExpertManagerIntro from './expert-manager-intro';
import BaseIntro from './base-intro';
import configureIntroJS from './configure-introjs';
import './intro-custom.scss';

export default module => {
  module.service('ExpertManagerIntro', ExpertManagerIntro);
  module.service('BaseIntro', BaseIntro);
  module.service('ncIntroUtils', ncIntroUtils);
  module.run(configureIntroJS);
};
