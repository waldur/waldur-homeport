// @ngInject
export default class AppstoreResourceLoader {
  constructor(ENV, $http, $q, ncUtils, servicesService) {
    this.ENV = ENV;
    this.$http = $http;
    this.$q = $q;
    this.ncUtils = ncUtils;
    this.servicesService = servicesService;
  }

  loadValidChoices(context, fields) {
    let promises = [];
    let validChoices = {};

    angular.forEach(fields, (field, name) => {
      if (field.resources) {
        promises = promises.concat(this.loadResources(context, field).then(response => {
          validChoices[name] = response;
        }));
      }

      if (field.resource) {
        field.url = this.getResourceUrl(field.resource);
      }

      if (field.url && name != 'service_project_link') {
        promises.push(this.loadUrl(context, field).then(response => {
          validChoices[name] = response;
        }));
      }
    });

    return this.$q.all(promises).then(() => validChoices);
  }

  loadUrl(context, field) {
    let parts = field.url.split('?');
    let base_url;
    let query;
    if (parts.length > 1) {
      base_url = parts[0];
      query = this.ncUtils.parseQueryString(parts[1]);
    } else {
      base_url = field.url;
      query = {};
    }
    query = angular.extend(query, context);

    return this.servicesService.getAll(query, base_url);
  }

  loadResources(context, field) {
    let choices = {};
    const spec = field.resources(context);
    const promises = Object.keys(spec).map(name => {
      const { endpoint, params } = spec[name];
      const url = this.getResourceUrl(endpoint);
      return this.$http.get(url, { params }).then(response => {
        choices[name] = response.data;
      });
    });
    return this.$q.all(promises).then(() => choices);
  }

  getResourceUrl(endpoint) {
    return `${this.ENV.apiEndpoint}api/${endpoint}/`;
  }
}
