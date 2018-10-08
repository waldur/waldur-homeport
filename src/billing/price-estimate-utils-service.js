export default class PriceEstimateUtilsService {
  // @ngInject
  constructor(invoicesService, $filter) {
    this.invoicesService = invoicesService;
    this.$filter = $filter;
  }

  loadInvoiceItems(customer_uuid) {
    const date = new Date();
    return this.invoicesService.getAll({
      customer_uuid: customer_uuid,
      year: date.getFullYear(),
      month: date.getMonth() + 1,
    }).then(this.parseInvoices.bind(this));
  }

  parseInvoices(invoices) {
    if (!Array.isArray(invoices)) {
      return [];
    }
    const invoice = invoices[0];
    const items = this.getInvoiceItems(invoice);
    return this.parseInvoiceItems(items);
  }

  getInvoiceItems(invoice) {
    const items = invoice.items || [];
    const openstack_items = invoice.openstack_items || [];
    const offering_items = invoice.offering_items || [];
    const generic_items = invoice.generic_items || [];
    return [
      ...items,
      ...openstack_items,
      ...offering_items,
      ...generic_items,
    ];
  }

  parseInvoiceItems(items) {
    /* Extract name, type and total price.
     * Omit empty invoice items.
     * Sort items by total in descending order.
     * Format total price with currency symbol.
     */
    const filter = this.$filter('defaultCurrency');
    return items
      .map(item => ({
        name: item.name,
        scope_type: item.scope_type.replace('.', ' '),
        total: parseFloat(item.total)
      }))
      .filter(item => item.total > 0)
      .sort((x, y) => x.total < y.total ? 1 : x.total > y.total ? -1 : 0)
      .map(item => ({
        ...item,
        total: filter(item.total),
      }));
  }
}
