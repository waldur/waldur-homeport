// @ngInject
export default class IssueFilterService {
  constructor(usersService,
              customersService,
              projectsService,
              resourcesService) {
    this.usersService = usersService;
    this.customersService = customersService;
    this.projectsService = projectsService;
    this.resourcesService = resourcesService;
  }

  refreshUsers(name) {
    const params = name && {full_name: name};
    return this.usersService.getList(params).then(users => {
      this.users = users;
    });
  }

  refreshCustomers(name) {
    const params = {};
    if (name) {
      params.name = name;
    }
    return this.customersService.getList(params).then(customers => {
      this.customers = customers;
    });
  }

  refreshProjects(name) {
    const params = name && {name};
    this.projectsService.filterByCustomer = false;
    return this.projectsService.getList(params).then(projects => {
      this.projects = projects;
    });
    this.projectsService.filterByCustomer = true;
  }

  refreshResources(name) {
    let params = {
      field: ['name', 'url']
    };
    if (name) {
      params.name = name;
    }
    this.resourcesService.filterByCustomer = false;
    return this.resourcesService.getList(params).then(resources => {
      this.resources = resources;
    });
    this.resourcesService.filterByCustomer = true;
  }
}
