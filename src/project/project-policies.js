import template from './project-policies.html';

const projectPolicies = {
  template: template,
  bindings: {
    project: '<',
  },
  controller: class ProjectPoliciesController {
    // @ngInject
    constructor(
      ENV,
      projectsService,
      certificationsService,
      ncUtilsFlash,
      customersService,
      priceEstimatesService,
      FreeIPAQuotaService,
      $rootScope,
      $q,
    ) {
      this.ENV = ENV;
      this.projectsService = projectsService;
      this.priceEstimatesService = priceEstimatesService;
      this.certificationsService = certificationsService;
      this.ncUtilsFlash = ncUtilsFlash;
      this.customersService = customersService;
      this.FreeIPAQuotaService = FreeIPAQuotaService;
      this.$rootScope = $rootScope;
      this.$q = $q;
    }

    $onInit() {
      this.currency = this.ENV.currency;
      this.canManage = false;
      this.projectCertifications = angular.copy(this.project.certifications);
      this.certificationsList = this.project.certifications
        .map(x => x.name)
        .join(', ');

      this.estimate = angular.copy(this.project.billing_price_estimate);
      this.isHardLimit = this.checkIsHardLimit(this.estimate);
      this.quota = this.FreeIPAQuotaService.loadQuota(this.project);

      this.loading = true;
      this.$q
        .all([
          this.certificationsService.getAll().then(certifications => {
            this.certifications = certifications;
          }),

          this.customersService.isOwnerOrStaff().then(canManage => {
            this.canManage = canManage;
          }),
        ])
        .finally(() => (this.loading = false));
    }

    updatePolicies() {
      let promises = [this.updatePriceEstimate(), this.saveCertifications()];

      if (this.quota) {
        promises.push(
          this.FreeIPAQuotaService.saveQuota(this.project, this.quota),
        );
      }

      return this.$q
        .all(promises)
        .then(() => {
          this.ncUtilsFlash.success(
            gettext('Project policies have been updated.'),
          );
        })
        .catch(response => {
          if (response.status === 400) {
            for (let name in response.data) {
              let error = response.data[name];
              this.ncUtilsFlash.error(error);
            }
          } else {
            this.ncUtilsFlash.error(
              gettext('An error occurred during policy update.'),
            );
          }
        });
    }

    updatePriceEstimate() {
      const limit = this.isHardLimit ? this.estimate.threshold : -1;
      return this.priceEstimatesService.update(this.estimate).then(() => {
        this.project.billing_price_estimate.threshold = this.estimate.threshold;
        this.project.billing_price_estimate.limit = limit;
      });
    }

    saveCertifications() {
      function mapItems(items) {
        return items.map(item => ({ url: item.url }));
      }
      const oldItems = mapItems(this.project.certifications);
      const newItems = mapItems(this.projectCertifications);
      if (angular.equals(oldItems, newItems)) {
        return this.$q.resolve();
      } else {
        return this.projectsService
          .updateCertifications(this.project.url, newItems)
          .then(() => {
            this.projectsService.clearAllCacheForCurrentEndpoint();
            this.$rootScope.$broadcast('refreshProjectList');
          });
      }
    }

    checkIsHardLimit(estimate) {
      return estimate.limit > 0 && estimate.limit === estimate.threshold;
    }

    isOverThreshold() {
      return (
        this.estimate.threshold > 0 &&
        this.estimate.total >= this.estimate.threshold
      );
    }
  },
};

export default projectPolicies;
