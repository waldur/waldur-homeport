import template from './ansible-job-create.html';

const ansibleJobCreate = {
  template: template,
  controller: class AnsibleJobCreateController {
    // @ngInject
    constructor(
      $stateParams,
      $state,
      ncUtilsFlash,
      AnsibleJobsService,
      AnsiblePlaybooksService,
      currentStateService) {
      this.$stateParams = $stateParams;
      this.$state = $state;
      this.ncUtilsFlash = ncUtilsFlash;
      this.AnsibleJobsService = AnsibleJobsService;
      this.AnsiblePlaybooksService = AnsiblePlaybooksService;
      this.currentStateService = currentStateService;
    }

    $onInit() {
      this.currentStateService.getProject().then(project => {
        this.project = project;
      });

      this.loading = true;
      this.AnsiblePlaybooksService.get(this.$stateParams.category)
        .then(this.parsePlaybook.bind(this))
        .finally(() => this.loading = false);
    }

    parsePlaybook(playbook) {
      this.playbook = playbook;
      this.model = {};
      this.fields = {
        order: ['name', 'description'],
        options: {
          name: {
            name: 'name',
            type: 'string',
            required: true,
            label: gettext('Name'),
            form_text: gettext('This name will be visible in accounting data.'),
            maxlength: 255,
          },
          description: {
            name: 'description',
            type: 'text',
            required: false,
            label: gettext('Description'),
            maxlength: 500,
          },
        }
      };

      playbook.parameters.forEach(parameter => {
        this.fields.order.push(parameter.name);
        this.fields.options[parameter.name] = {
          name: parameter.name,
          label: parameter.description || parameter.name,
          type: 'string',
          required: parameter.required,
        };
        if (parameter.default) {
          this.model[parameter.name] = parameter.default;
        }
      });
    }

    save() {
      const { name, description, ...parameters } = this.model;
      const job = {
        name,
        description,
        arguments: parameters,
        project: this.project.url,
        playbook: this.playbook.url,
      };
      return this.AnsibleJobsService.create(job).then(job => {
        this.ncUtilsFlash.success(gettext('Application has been created.'));
        this.$state.go('project.resources.ansible.details', {
          uuid: job.project_uuid,
          jobId: job.uuid
        });
      }).catch(response => {
        this.errors = response.data;
        this.ncUtilsFlash.error(gettext('Unable to create application.'));
      });
    }
  }
};

export default ansibleJobCreate;
