import ENV from './base-config';
import translateProvider from './i18n-config';

export default function configModule(module) {
  module.constant('ENV', ENV);
  module.config(translateProvider);
}
