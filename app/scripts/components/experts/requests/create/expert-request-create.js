import template from './expert-request-create.html';

const expertRequestCreate = {
  template,
  controller: class ExpertRequestCreateController {
    // @ngInject
    constructor(
      $stateParams,
      $state,
      $q,
      ncUtilsFlash,
      expertRequestsService,
      currentStateService) {
      this.$stateParams = $stateParams;
      this.$state = $state;
      this.$q = $q;
      this.ncUtilsFlash = ncUtilsFlash;
      this.expertRequestsService = expertRequestsService;
      this.currentStateService = currentStateService;
    }

    $onInit() {
      this.model = {};
      this.requestType = this.$stateParams.category;
      this.loading = true;

      this.$q.all([
        this.currentStateService.getProject().then(project => {
          this.project = project;
        }),
        this.expertRequestsService.getConfiguration().then(response => {
          this.contractTemplate = response;
          const offerings = response.offerings;
          if (!offerings[this.requestType]) {
            return this.$state.go('errorPage.notFound');
          }
          this.expert = offerings[this.requestType];
          this.expert.order.unshift('name', 'objectives', 'price');
          angular.extend(this.expert.options, {
            name: {
              type: 'string',
              required: true,
              label: gettext('Name'),
              form_text: gettext('This name will be visible in accounting data.'),
              max_length: 150
            },
            objectives: {
              type: 'html_text',
              label: gettext('Objectives'),
              required: true,
              default_value: gettext('This is an objective.'),
            },
            price: {
              type: 'money',
              label: gettext('Planned budget'),
            },
          });
          angular.forEach(this.expert.options, (option, name) => option.name = name);
          this.model.name = this.expert.label;
        })
      ]).finally(() => this.loading = false);
    }

    cancel() {
      this.$state.go('project.details', {uuid: this.project.uuid});
    }

    save() {
      const expertRequest = angular.extend({
        type: this.requestType,
        project: this.project.url,
      }, this.model);
      return this.expertRequestsService.create(expertRequest).then(expert => {
        this.ncUtilsFlash.success(gettext('Expert request has been created.'));
        this.expertRequestsService.clearAllCacheForCurrentEndpoint();
        this.$state.go('project.expertRequestDetails', {
          uuid: this.project.uuid,
          requestId: expert.uuid,
        });
      }, response => {
        this.errors = response.data;
        this.ncUtilsFlash.errorFromResponse(response, gettext('Expert request could not be created'));
      });
    }
  }
};

export default expertRequestCreate;
