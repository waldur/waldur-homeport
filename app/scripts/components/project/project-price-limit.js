import template from './project-price-limit.html';
import './project-price-limit.scss';

const projectPriceLimit = {
  template,
  bindings: {
    project: '<'
  },
  controller: class ProjectPriceLimitController {
    constructor(projectsService, customersService, $q) {
      // @ngInject
      this.projectsService = projectsService;
      this.customersService = customersService;
      this.$q = $q;
    }

    $onInit() {
      this.loading = true;
      this.estimate = this.project.price_estimate;
      this.isHardLimit = this.estimate.limit > 0 && this.estimate.limit == this.estimate.threshold;
      return this.customersService.isOwnerOrStaff().then(value => {
        this.userCanManageProjects = value;
        this.loading = false;
      });
    }

    isOverThreshold() {
      return this.estimate.threshold > 0 && this.estimate.total >= this.estimate.threshold;
    }

    setThreshold(value) {
      let promises = [];
      if (this.isHardLimit) {
        promises.push(this.projectsService.setLimit(this.project.url, value));
      }
      promises.push(this.projectsService.setThreshold(this.project.url, value));
      return this.$q.all(promises);
    }

    toggleLimit() {
      this.isHardLimit = !this.isHardLimit;
      var limit = this.isHardLimit && this.estimate.threshold || 0;
      return this.projectsService.setLimit(this.project.url, limit);
    }
  }
};

export default projectPriceLimit;
