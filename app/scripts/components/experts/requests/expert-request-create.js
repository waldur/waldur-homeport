import template from './expert-request-create.html';

const expertRequestCreate = {
  template: template,
  controller: class ExpertRequestCreateController {
    // @ngInject
    constructor(
      $stateParams,
      $state,
      ncUtilsFlash,
      expertRequestsService,
      currentStateService) {
      this.$stateParams = $stateParams;
      this.$state = $state;
      this.ncUtilsFlash = ncUtilsFlash;
      this.expertRequestsService = expertRequestsService;
      this.currentStateService = currentStateService;
    }

    $onInit() {
      this.model = {};
      this.requestType = this.$stateParams.category;
      this.loading = true;

      this.currentStateService.getProject().then(project => {
        this.project = project;
      });

      this.expertRequestsService.getConfiguration().then(response => {
        const expert = response[this.requestType];
        if (!expert) {
          return this.$state.go('errorPage.notFound');
        }
        this.expert = expert;
        this.expert.order.unshift('name', 'description');
        angular.extend(this.expert.options, {
          name: {
            type: 'string',
            required: true,
            label: gettext('Name'),
            form_text: gettext('This name will be visible in accounting data.'),
            max_length: 150
          },
          description: {
            type: 'string',
            required: false,
            label: gettext('Description'),
          },
        });
        angular.forEach(expert.options, (option, name) => option.name = name);
      }).finally(() => this.loading = false);
    }

    save() {
      const expertRequest = angular.extend({
        type: this.requestType,
        project: this.project.url,
      }, this.model);
      return this.expertRequestsService.create(expertRequest).then(expert => {
        this.ncUtilsFlash.success(gettext('Expert request has been created.'));
        this.expertRequestsService.clearAllCacheForCurrentEndpoint();
        this.$state.go('expertRequestDetails', {uuid: expert.uuid});
      }, response => {
        this.errors = response.data;
        // TODO [TM:7/12/17] temporary, remove when expert request feature fully implemented.
        let details = '';
        if (response.status !== 400) {
          details = `Status: ${response.status}. Errors: ${JSON.stringify(response.data)}`;
        }
        this.ncUtilsFlash.error(gettext('Unable to create expert request.') + details);
      });
    }
  }
};

export default expertRequestCreate;
