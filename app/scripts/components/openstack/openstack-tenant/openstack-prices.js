import { templateParser } from '../utils';
import { openstackTemplateColumns, openstackTemplateFilters } from './openstack-template';

import template from './openstack-prices.html';

const openstackPrices = {
  template,
  bindings: {
    provider: '<'
  },
  controller: class OpenstackPricesController {
    // @ngInject
    constructor(packageTemplatesService) {
      this.service = packageTemplatesService;
      this.columns = openstackTemplateColumns;
      this.filterOptions = openstackTemplateFilters;
    }

    $onInit() {
      this.loading = true;
      this.loadData().finally(this.loading = false);
    }

    loadData() {
      return this.service.getAll({
        service_settings_uuid: this.provider.settings_uuid
      })
      .then(templates => templates.map(templateParser))
      .then(templates => this.templates = templates);
    }
  }
};

export default openstackPrices;
