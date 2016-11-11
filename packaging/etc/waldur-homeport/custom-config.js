'use strict';

angular.module('ncsaas').constant('CUSTOMENV', {
  // general config
  name: 'development',

  // auth config
  facebookClientId: 'FIXME',
  googleClientId: 'FIXME',
});

angular.module('ncsaas').value('LANGUAGE', {
  CHOICES: [
    {code: 'en', label: 'English'},
    {code: 'et', label: 'Estonian'},
    {code: 'fi', label: 'Finnish'},
    {code: 'ru', label: 'Russian'},
    {code: 'uk', label: 'Ukrainian'}
  ],
  DEFAULT: 'en'
});
