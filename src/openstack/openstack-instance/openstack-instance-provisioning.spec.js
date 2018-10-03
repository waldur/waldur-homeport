import OpenStackInstanceConfig from './openstack-instance-config';
import appstoreStore from '../../appstore/appstore-store';
import fieldLabel from './../../form/field-label';
import appstoreFormFieldset from './../../form/appstore-form-fieldset';
import appstoreForm from './../../form/appstore-form';
import appstoreField from './../../form/appstore-field';
import appstoreFieldLabel from './../../form/appstore-field-label';
import appstoreFieldString from './../../form/appstore-field-string';
import appstoreFieldText from './../../form/appstore-field-text';
import appstoreFieldInteger from './../../form/appstore-field-integer';
import appstoreFieldErrors from './../../form/appstore-field-errors';
import appstoreFieldList from  './../../form/appstore-field-list';
import openstackInstanceDataVolume from './../openstack-instance/openstack-instance-data-volume';
import openstackInstanceSecurityGroupsField from './../openstack-instance/openstack-instance-security-groups-field';
import openstackInstanceInternalIpsList from './../openstack-instance/openstack-instance-internal-ips-list';
import openstackInstanceNetworks from './../openstack-instance/openstack-instance-networks';
import openstackInstanceFloatingIps from './../openstack-instance/openstack-instance-floating-ips';
import {baseControllerAddClass, baseControllerClass} from './../../controllers/base-controller-class';
import coreModule from '../../core/module';

describe('OpenStack Instance Store', function() {
  const API_ENDPOINT = 'https://example.com/';
  const CATEGORY_KEY = 'vms';

  function initModule(module) {
    module.service('$uibModal', function(){});
    module.service('$uibModalStack', function(){});
    module.service('AppStoreUtilsService', function(){});
    module.service('BreadcrumbsService', function(){});
    module.service('baseControllerClass', baseControllerClass);
    module.service('baseControllerAddClass', baseControllerAddClass);
    module.directive('fieldLabel', fieldLabel);
    module.directive('appstoreFieldInteger', appstoreFieldInteger);
    module.directive('appstoreFieldErrors', appstoreFieldErrors);
    module.directive('appstoreFieldLabel', appstoreFieldLabel);
    module.directive('appstoreFieldString', appstoreFieldString);
    module.directive('appstoreFieldText', appstoreFieldText);
    module.directive('appstoreFieldList', appstoreFieldList);
    module.directive('appstoreField', appstoreField);
    module.component('openstackInstanceDataVolume', openstackInstanceDataVolume);
    module.component('openstackInstanceSecurityGroupsField', openstackInstanceSecurityGroupsField);
    module.component('openstackInstanceInternalIpsList', openstackInstanceInternalIpsList);
    module.component('openstackInstanceNetworks', openstackInstanceNetworks);
    module.component('openstackInstanceFloatingIps', openstackInstanceFloatingIps);
    module.component('appstoreFormFieldset', appstoreFormFieldset);
    module.directive('appstoreForm', appstoreForm);
    module.component('appstoreStore', appstoreStore);
    module.constant('ENV', {
      apiEndpoint: API_ENDPOINT,
      resourceCategory: { 'OpenStackTenant.Instance': CATEGORY_KEY }
    });
    coreModule(module);
  }

  initModule(angular.module('openstack-instance-store', ['ngResource', 'ui.router', 'pascalprecht.translate']));
  beforeEach(angular.mock.module('openstack-instance-store'));

  let category = {
    key: CATEGORY_KEY,
    name: 'Virtual Machines',
  };
  let user = {
    full_name: 'Tomy Branko'
  };
  let customer = {
    name: 'Jasmine'
  };
  let serviceType = 'OpenStackTenant';
  let POST = {
    data_volume_size: {
      label: 'Data volume size',
      min_value: 1024,
      required: false,
      type: 'integer'
    },
    description: {
      label: 'Description',
      maxlength: 500,
      required: false,
      type: 'string'
    },
    flavor: {
      display_name_field: 'display_name',
      label: 'Flavor',
      required: true,
      type: 'select',
      url: `${API_ENDPOINT}/api/openstacktenant-flavors/`,
      value_field: 'url'
    },
    floating_ips: {
      label: 'Floating ips',
      many: true,
      required: false,
      type: 'field'
    },
    image: {
      display_name_field: 'display_name',
      label: 'Image',
      required: true,
      type: 'select',
      url: `${API_ENDPOINT}/api/openstacktenant-images/`,
      value_field: 'url'
    },
    internal_ips_set: {
      label: 'Internal ips set',
      many: true,
      required: false,
      type: 'field'
    },
    name: {
      label: 'Name',
      maxlength: 150,
      required: true,
      type: 'string'
    },
    security_groups: {
      label: 'Security groups',
      many: true,
      required: false,
      type: 'field'
    },
    service_project_link: {
      display_name_field: 'display_name',
      label: 'Service project link',
      required: true,
      type: 'select',
      url: `${API_ENDPOINT}/api/openstacktenant-service-project-link/`,
      value_field: 'url'
    },
    ssh_public_key: {
      display_name_field: 'display_name',
      label: 'Ssh public key',
      required: false,
      type: 'select',
      url: `${API_ENDPOINT}/api/keys/?user_uuid=a8ed784de4474284a6088261537a6430`,
      value_field: 'url'
    },
    system_volume_size: {
      label: 'System volume size',
      min_value: 1024,
      required: true,
      type: 'integer'
    },
    user_data: {
      help_text: 'Additional data that will be added to instance on provisioning',
      label: 'User data',
      required: false,
      type: 'string'
    }
  };
  let project = {
    certifications: [],
    created: '2017-06-09T14:48:03.314287Z',
    customer: `${API_ENDPOINT}/api/customers/bdbfd63db1a3489e9a8b5f7d339297eb/`,
    customer_abbreviation: '',
    customer_name: 'Apollo',
    customer_native_name: '',
    customer_uuid: 'bdbfd63db1a3489e9a8b5f7d339297eb',
    description: 'Description',
    name: 'Soyuz',
    permissions: [],
    billing_price_estimate: {
      limit: 5000,
      threshold: 5000,
      total: 4.16553889333333
    },
    services: [
      {
        uuid: 'da859666f3a448a3a003c521a5dc3dae',
        url: `${API_ENDPOINT}/api/openstacktenant/da859666f3a448a3a003c521a5dc3dae/`,
        service_project_link_url: `${API_ENDPOINT}/api/openstacktenant-service-project-link/1/`,
        name: 'VPC #1 [TM]',
        type: 'OpenStackTenant',
        state: 'OK',
        shared: false,
        settings_uuid: '756c0dfe0191451aa5ea821fc59c2d66',
        settings: `${API_ENDPOINT}/api/service-settings/756c0dfe0191451aa5ea821fc59c2d66/`,
        validation_state: 'OK',
        validation_message: ''
      }
    ],
    url: `${API_ENDPOINT}/api/projects/125badfd24af40ee828f2f5933e0a966/`,
    uuid: '125badfd24af40ee828f2f5933e0a966'
  };
  let serviceMetadata = {
    is_public_service: false,
    properties: {
      Flavor: `${API_ENDPOINT}/api/openstacktenant-flavors/`,
      FloatingIP: `${API_ENDPOINT}/api/openstacktenant-floating-ips/`,
      Image: `${API_ENDPOINT}/api/openstacktenant-images/`,
      Network: `${API_ENDPOINT}/api/openstacktenant-networks/`,
      SecurityGroup: `${API_ENDPOINT}/api/openstacktenant-security-groups/`,
      SubNet: `${API_ENDPOINT}/api/openstacktenant-subnets/`
    },
    resources: {
      Instance: `${API_ENDPOINT}/api/openstacktenant-instances/`,
    },
    service_project_link_url: `${API_ENDPOINT}/api/openstacktenant-service-project-link/`,
    url: `${API_ENDPOINT}/api/openstacktenant/`
  };
  let validInstance = {
    flavor: 'flavor',
    image: 'image',
    name: 'VM 1',
    service_project_link: project.services[0].service_project_link_url,
    system_volume_size: 1024,
  };

  beforeEach(angular.mock.module(function($provide) {
    $provide.factory('currentStateService', function($q) {
      return {
        getCustomer: jasmine.createSpy('getCustomer').and.returnValue($q.when(customer)),
        getProject: jasmine.createSpy('getProject').and.returnValue($q.when(project)),
        reloadCurrentCustomer: jasmine.createSpy('reloadCurrentCustomer').and.returnValue($q.when([])),
      };
    });
    $provide.factory('usersService', function($q) {
      return {
        getCurrentUser: jasmine.createSpy('getCurrentUser').and.returnValue($q.when(user))
      };
    });
    $provide.factory('resourcesService', function($q) {
      return {
        $create: jasmine.createSpy('$create').and.returnValue({}),
        clearAllCacheForCurrentEndpoint: jasmine.createSpy('clearAllCacheForCurrentEndpoint').and.returnValue(
          $q.when([])),
      };
    });
    $provide.factory('joinService', function($q) {
      return {
        clearAllCacheForCurrentEndpoint: jasmine.createSpy('clearAllCacheForCurrentEndpoint').and.returnValue(
          $q.when([])),
      };
    });
    $provide.factory('ncUtilsFlash', function() {
      return {
        success: jasmine.createSpy('success'),
        error: jasmine.createSpy('error'),
      };
    });
    $provide.factory('projectsService', function($q) {
      return {
        clearAllCacheForCurrentEndpoint: jasmine.createSpy('clearAllCacheForCurrentEndpoint').and.returnValue(
          $q.when([])),
      };
    });
    $provide.factory('priceEstimationService', function($q) {
      return {
        clearAllCacheForCurrentEndpoint: jasmine.createSpy('clearAllCacheForCurrentEndpoint').and.returnValue(
          $q.when([])),
      };
    });
    $provide.factory('ncServiceUtils', function() {
      return {
      };
    });
    $provide.factory('resourceUtils', function() {
      return {
      };
    });
    $provide.factory('CategoriesService', function() {
      return {
        getResourceCategories: jasmine.createSpy('getResourceCategories').and.returnValue([{
          name: category.name,
          key: category.key,
          services: [serviceType]
        }]),
      };
    });
    $provide.factory('AppstoreFieldConfiguration', function() {
      return {
        'OpenStack.Instance': OpenStackInstanceConfig
      };
    });
    $provide.factory('AppstoreResourceLoader', function($q) {
      return {
        loadValidChoices: jasmine.createSpy('loadValidChoices').and.returnValue($q.when([])),
      };
    });
    $provide.factory('AppstoreProvidersService', function($q) {
      return {
        loadServices: jasmine.createSpy('loadServices').and.callFake((project) => {
          // loadServices modifies input parameter
          for(let i=0; i<project.services.length; i++) {
            let service = project.services[i];
            service.enabled = true;
          }
          return $q.when([]);
        }),
      };
    });
    $provide.factory('ResourceProvisionPolicy', function() {
      return {
        checkResource: jasmine.createSpy('checkResource').and.returnValue({disabled: false, errorMessage: ''}),
      };
    });
    $provide.factory('servicesService', function($q) {
      return {
        getOption: jasmine.createSpy('getOption').and.returnValue($q.when({
          actions: {
            POST: POST
          }
        })),
        getServicesList: jasmine.createSpy('getServicesList').and.returnValue($q.when({
          OpenStackTenant: serviceMetadata
        })),
        $create: jasmine.createSpy('$create').and.returnValue(validInstance),
      };
    });
    $provide.factory('$state', function() {
      return {
        $current: {data: {category: category.key}}
      };
    });
  }));

  let $rootScope, $q, $compile, element, controller, servicesService, scope;
  let usersService, currentStateService, CategoriesService, AppstoreProvidersService, ResourceProvisionPolicy,
    AppstoreResourceLoader, priceEstimationService, joinService, projectsService, ncUtilsFlash, resourcesService;

  beforeEach(inject(function(_$rootScope_, _$compile_, _$q_, _servicesService_,
                             _usersService_, _currentStateService_, _CategoriesService_, _AppstoreProvidersService_,
                            _ResourceProvisionPolicy_, _AppstoreResourceLoader_, _priceEstimationService_,
                            _joinService_, _projectsService_, _ncUtilsFlash_, _resourcesService_){
    servicesService = _servicesService_;
    $rootScope = _$rootScope_;
    $compile = _$compile_;
    $q = _$q_;

    usersService = _usersService_;
    currentStateService = _currentStateService_;
    CategoriesService = _CategoriesService_;
    AppstoreProvidersService = _AppstoreProvidersService_;
    ResourceProvisionPolicy = _ResourceProvisionPolicy_;
    AppstoreResourceLoader = _AppstoreResourceLoader_;
    priceEstimationService = _priceEstimationService_;
    joinService = _joinService_;
    projectsService = _projectsService_;
    ncUtilsFlash = _ncUtilsFlash_;
    resourcesService = _resourcesService_;

    scope = $rootScope.$new();
    let html = '<appstore-store></appstore-store>';
    element = angular.element(html);
    element = $compile(element)(scope);
    controller = element.controller('appstoreStore');
    $rootScope.$apply();
  }));

  it('has a right chain of service calls on activation', () => {
    expect(usersService.getCurrentUser).toHaveBeenCalled();
    expect(currentStateService.getCustomer).toHaveBeenCalled();
    expect(servicesService.getServicesList).toHaveBeenCalled();
    expect(CategoriesService.getResourceCategories).toHaveBeenCalled();
    expect(AppstoreProvidersService.loadServices).toHaveBeenCalled();
    expect(ResourceProvisionPolicy.checkResource).toHaveBeenCalledWith(user, customer, project, category.key);
    expect(servicesService.getOption).toHaveBeenCalledWith(serviceMetadata.resources.Instance);

    let expectedContext = {
      project: project.uuid,
      project_uuid: project.uuid,
      service_uuid: project.services[0].uuid,
      settings_uuid: project.services[0].settings_uuid,
      service_settings_uuid: project.services[0].settings_uuid,
    };
    expect(AppstoreResourceLoader.loadValidChoices).toHaveBeenCalledWith(expectedContext, controller.allFormOptions);
  });

  xit('displays fields in the configured order', () => {
    let controlLabels = element[0].querySelectorAll('.control-label');
    // skip provider label
    let providerLabel = angular.element(controlLabels[0].querySelector('label')).text();
    expect(providerLabel).toBe('Provider');

    let renderedLabels = [];
    for (let i=1; i<controlLabels.length; i++) {
      let label = angular.element(controlLabels[i].querySelector('field-label')).text();
      if (label !== 'Data volume size ' && label !== 'Floating ips ' && label !== 'Internal ips set ') {
        renderedLabels.push(label);
      }
    }

    expect(renderedLabels.length).not.toBe(0);

    let expectedLabels = [];
    for (let i=0; i<controller.fields.order.length; i++) {
      let order = controller.fields.order[i];
      let option = OpenStackInstanceConfig.options[order];
      if (option && option.label) {
        expectedLabels.push(option.label);
      }
    }

    for (let i=0; i<expectedLabels.length; i++) {
      // replace vm if contains, for instance 'vm name'
      let expectedLabel = expectedLabels[i].toLowerCase().replace('vm ', '');
      let actualLabel = renderedLabels[i].toLowerCase();
      expect(actualLabel).toContain(expectedLabel);
    }
  });

  it('can not create instance if form is empty', () => {
    expect(controller.canSave()).toBeFalsy();
  });

  it('can create instance if form is filled in', () => {
    controller.instance = validInstance;

    expect(controller.canSave()).toBeTruthy();
  });

  it('triggers save confirmation on save', () => {
    controller.instance = validInstance;
    controller.fields.saveConfirmation = jasmine.createSpy('saveConfirmation').and.returnValue($q.when([]));

    controller.save();

    expect(controller.fields.saveConfirmation).toHaveBeenCalledWith($q, controller.instance);
  });

  it('saves instance on save', () => {
    controller.instance = validInstance;
    controller.fields.saveConfirmation = jasmine.createSpy('saveConfirmation').and.returnValue($q.when([]));
    controller.successRedirect = jasmine.createSpy('successRedirect').and.returnValue($q.when([]));
    validInstance.$save = jasmine.createSpy('$save').and.returnValue($q.when([]));

    controller.save();
    $rootScope.$apply();

    expect(controller.fields.saveConfirmation).toHaveBeenCalledWith($q, controller.instance);
    expect(servicesService.$create).toHaveBeenCalledWith(serviceMetadata.resources.Instance);
    expect(validInstance.$save).toHaveBeenCalled();
    expect(currentStateService.reloadCurrentCustomer).toHaveBeenCalled();
    expect(projectsService.clearAllCacheForCurrentEndpoint).toHaveBeenCalled();
    expect(priceEstimationService.clearAllCacheForCurrentEndpoint).toHaveBeenCalled();
    expect(joinService.clearAllCacheForCurrentEndpoint).toHaveBeenCalled();
    expect(ncUtilsFlash.success).toHaveBeenCalledWith(controller.getSuccessMessage());
    expect(resourcesService.clearAllCacheForCurrentEndpoint).toHaveBeenCalled();
    expect(controller.successRedirect).toHaveBeenCalled();
  });

  it('does not trigger save if it was not confirmed', () => {
    controller.instance = validInstance;
    controller.fields.saveConfirmation = jasmine.createSpy('saveConfirmation').and.returnValue($q.reject());
    controller.successRedirect = jasmine.createSpy('successRedirect');
    validInstance.$save = jasmine.createSpy('$save');

    controller.save();
    $rootScope.$apply();

    expect(controller.fields.saveConfirmation).toHaveBeenCalledWith($q, controller.instance);
    expect(servicesService.$create).not.toHaveBeenCalled();
    expect(validInstance.$save).not.toHaveBeenCalled();
    expect(currentStateService.reloadCurrentCustomer).not.toHaveBeenCalled();
    expect(projectsService.clearAllCacheForCurrentEndpoint).not.toHaveBeenCalled();
    expect(priceEstimationService.clearAllCacheForCurrentEndpoint).not.toHaveBeenCalled();
    expect(joinService.clearAllCacheForCurrentEndpoint).not.toHaveBeenCalled();
    expect(resourcesService.clearAllCacheForCurrentEndpoint).not.toHaveBeenCalled();
    expect(controller.successRedirect).not.toHaveBeenCalled();
  });

  it('shows error on instance save error', () => {
    controller.instance = validInstance;
    controller.fields.saveConfirmation = jasmine.createSpy('saveConfirmation').and.returnValue($q.when([]));
    controller.successRedirect = jasmine.createSpy('successRedirect');
    validInstance.$save = jasmine.createSpy('$save').and.throwError('Error');

    controller.save();
    $rootScope.$apply();

    expect(controller.fields.saveConfirmation).toHaveBeenCalledWith($q, controller.instance);
    expect(servicesService.$create).toHaveBeenCalledWith(serviceMetadata.resources.Instance);
    expect(validInstance.$save).toHaveBeenCalled();
    expect(currentStateService.reloadCurrentCustomer).not.toHaveBeenCalled();
    expect(projectsService.clearAllCacheForCurrentEndpoint).not.toHaveBeenCalled();
    expect(priceEstimationService.clearAllCacheForCurrentEndpoint).not.toHaveBeenCalled();
    expect(joinService.clearAllCacheForCurrentEndpoint).not.toHaveBeenCalled();
    expect(resourcesService.clearAllCacheForCurrentEndpoint).not.toHaveBeenCalled();
    expect(controller.successRedirect).not.toHaveBeenCalled();
  });
});
