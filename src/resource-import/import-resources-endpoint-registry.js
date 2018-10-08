export default class ImportResourcesEndpointRegistry {
  // @ngInject
  constructor(ENV) {
    this._endpoints = {};
    angular.forEach(ENV.resourcesTypes, resourceType => {
      this._endpoints[resourceType] = {};
    });
  }

  registerEndpoint(category, provider_type, service) {
    this._endpoints[category][provider_type] = service;
  }

  getEndpoint(category, provider_type) {
    return this._endpoints[category][provider_type];
  }

  isRegistered(category, provider_type) {
    return !!this._endpoints[category][provider_type];
  }
}
