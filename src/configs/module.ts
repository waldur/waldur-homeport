import translateProvider from './i18n-config';

export default function configModule(module) {
  module.config(translateProvider);
}
