import template from './provider-project-link-quota.html';

const providerProjectLinkQuota = {
  template: template,
  bindings: {
    choice: '<',
    quota: '<',
    multiplyFactor: '<',
  },
  require:{
    parentForm: '^form',
  },
  controller: class ProviderProjectLinkQuotaController {
    // @ngInject
    constructor(coreUtils, $filter){
      this.$filter = $filter;
      this.coreUtils = coreUtils;
      this.multiplyFactor = this.multiplyFactor || 1;
    }
    exceeds() {
      return this.quota.limit < this.quota.usage && !this.quota.unlimited;
    }
    getUsageSummary(){
      return this.coreUtils.templateFormatter(gettext('{usage} used'), {
        usage: this.$filter('quotaValue')(this.quota.usage, this.quota.name),
      });
    }
    onLimitChange() {
      this.choice.dirty = true;
      let limitValidity = this.quota.unlimited || this.quota.limit >= this.quota.usage;
      this.parentForm[this.quota.name].$setValidity('minLimit', limitValidity);
    }
    hasError() {
      return this.parentForm[this.quota.name].$error.minLimit;
    }
  }
};

export default providerProjectLinkQuota;
