'use strict';

angular.module('ncsaas')
  .constant('ENV', {
    // general config
    name: '',
    apiEndpoint: 'http://localhost:8080/',

    // auth config
    googleCliendId: 'google client id',
    googleEndpointUrl: 'api-auth/google/',
    facebookCliendId: 'facebook client id',
    facebookEndpointUrl: 'api-auth/facebook/',

  });
