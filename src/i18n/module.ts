import { LanguageUtilsService } from './LanguageUtilsService';

export default (module) => {
  module.run(() => {
    LanguageUtilsService.checkLanguage();
  });
};
