export default class DeleteCustomerAction {
  /* This class implements business logic for organization deletion.
   * Staff can delete any organization without projects.
   * Customer owner can delete owned organization without projects and invoices.
   */

  constructor(ENV, customer, user, invoices) {
    this.ENV = ENV;
    this.customer = customer;
    this.user = user;
    this.invoices = invoices;
  }

  get hasPermission() {
    return this.user.is_staff || (this.isOwner && this.ENV.plugins.WALDUR_CORE.OWNER_CAN_MANAGE_CUSTOMER);
  }

  get needsSupport() {
    return this.hasProjects || this.hasActiveInvoices;
  }

  get notification() {
    if (this.hasProjects) {
      return gettext('Organization contains projects. Please remove them first.');
    }
    if (this.hasActiveInvoices) {
      return gettext('Organization contains invoices. Please remove them first.');
    }
  }

  get hasProjects() {
    return this.customer.projects.length > 0;
  }

  get isOwner() {
    return this.customer.owners.some(owner => owner.uuid === this.user.uuid);
  }

  get hasActiveInvoices() {
    return this.invoices.some(invoice => (invoice.state !== 'pending') || (parseFloat(invoice.price) > 0));
  }
}
