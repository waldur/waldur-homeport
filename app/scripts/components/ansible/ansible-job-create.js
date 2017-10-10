import template from './ansible-job-create.html';

const ansibleJobCreate = {
  template: template,
  controller: class AnsibleJobCreateController {
    // @ngInject
    constructor(
      $q,
      $stateParams,
      $state,
      ncUtilsFlash,
      AnsibleJobsService,
      AnsiblePlaybooksService,
      AppstoreProvidersService,
      keysService,
      usersService,
      currentStateService) {
      this.$q = $q;
      this.$stateParams = $stateParams;
      this.$state = $state;
      this.ncUtilsFlash = ncUtilsFlash;
      this.AnsibleJobsService = AnsibleJobsService;
      this.AnsiblePlaybooksService = AnsiblePlaybooksService;
      this.AppstoreProvidersService = AppstoreProvidersService;
      this.keysService = keysService;
      this.usersService = usersService;
      this.currentStateService = currentStateService;
      this.loading = true;
      this.selectedService = null;
    }

    $onInit() {
      this.$q.all([
        this.loadKeys(),
        this.loadServices(),
        this.loadPlaybook(),
      ]).finally(() => this.loading = false);
    }

    loadKeys() {
      return this.usersService.getCurrentUser().then(user => {
        return this.keysService.getAll({
          user_uuid: user.uuid
        }).then(keys => {
          this.keys = keys;
        });
      });
    }

    loadServices() {
      return this.currentStateService.getProject().then(project => {
        this.project = project;
        return this.AppstoreProvidersService.loadServices(project).then(project => {
          this.services = project.services
            .filter(service => service.type === 'OpenStackTenant')
            .sort(function(a, b) {
              return a.enabled < b.enabled;
            });
        });
      });
    }

    setService(service) {
      this.selectedService = service;
      this.initModel();
    }

    resetService() {
      this.selectedService = null;
    }

    loadPlaybook() {
      return this.AnsiblePlaybooksService.get(this.$stateParams.category)
        .then(playbook => this.playbook = playbook);
    }

    initModel() {
      this.model = {};
      this.fields = {
        order: ['name', 'description', 'ssh_public_key'],
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
          ssh_public_key: {
            name: 'ssh_public_key',
            type: 'list',
            label: gettext('SSH public key'),
            columns: [
              {
                name: 'name',
                label: gettext('Name')
              },
              {
                name: 'fingerprint',
                label: gettext('Fingerprint')
              }
            ],
            choices: this.keys,
            preselectFirst: true,
            emptyMessage: gettext('You have not added any SSH keys to your <a ui-sref="profile.keys">profile</a>.')
          },
        }
      };

      this.playbook.parameters.forEach(parameter => {
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

    createJob() {
      const payload = this.AnsibleJobsService.getPayload(
        this.model, this.playbook, this.selectedService);
      return this.AnsibleJobsService.create(payload);
    }

    save() {
      this.createJob().then(job => {
        this.ncUtilsFlash.success(gettext('Application creation has been scheduled.'));
        this.AnsibleJobsService.clearAllCacheForCurrentEndpoint();
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
