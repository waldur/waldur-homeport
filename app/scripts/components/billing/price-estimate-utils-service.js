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
    const filter = this.$filter('defaultCurrency');
    const result = [];
    items.forEach(item => {
      const name = item.name;
      const total = parseFloat(item.total);
      if (!total) {
        return;
      }
      result.push({name, total: filter(total)});
    });
    return result;
  }
}
