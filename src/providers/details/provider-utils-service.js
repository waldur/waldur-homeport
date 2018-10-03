class ProviderUtilsService {
  // @ngInject
  constructor($q, ENV, joinService, servicesService, usersService, customersService) {
    this.$q = $q;
    this.ENV = ENV;
    this.joinService = joinService;
    this.servicesService = servicesService;
    this.usersService = usersService;
    this.customersService = customersService;
  }

  async loadData(context) {
    let provider, settings, settingsVisible;

    if (context.provider) {
      provider = context.provider;
    } else {
      provider = await this.joinService.$get(context.provider_type, context.provider_uuid);
    }

    settings = await this.servicesService.$get(null, provider.settings);
    const user = await this.usersService.getCurrentUser();

    // User can update settings only if he is an owner of their customer or a staff
    if (!settings.customer) {
      settingsVisible = user.is_staff;
    } else {
      const customer = await this.customersService.$get(null, settings.customer);
      settingsVisible = this.customersService.checkCustomerUser(customer, user);

      // Do not display provider settings for tenants if direct access is not enabled
      if (provider.service_type === 'OpenStackTenant') {
        settingsVisible = settingsVisible && this.ENV.plugins.WALDUR_OPENSTACK.TENANT_CREDENTIALS_VISIBLE;
      }

      // Do not display provider settings if only staff manages services but user is not staff
      if (this.ENV.onlyStaffManagesServices && !user.is_staff) {
        settingsVisible = false;
      }
    }

    return { provider, settings, settingsVisible };
  }
}

export default ProviderUtilsService;
