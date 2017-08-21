export default class ImportVirtualMachineEndpointRegistry {
  // @ngInject
  constructor() {
    this._endpoints = {};
  }

  registerEndpoint(provider_type, service) {
    this._endpoints[provider_type] = service;
  }

  getEndpoint(provider_type) {
    return this._endpoints[provider_type];
  }

  isRegistered(provider_type) {
    return !!this._endpoints[provider_type];
  }
}
