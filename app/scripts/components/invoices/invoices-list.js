// @ngInject
export default function InvoicesListController(
  baseControllerListClass,
  currentStateService,
  invoicesService,
  currentUser,
  ncUtilsFlash,
  $state,
  $filter) {
  var controllerScope = this;
  var InvoicesController = baseControllerListClass.extend({
    init: function() {
      this.service = invoicesService;
      this.getSearchFilters();
      this.tableOptions = this.getTableOptions();
      this._super();
    },
    getList: function(filter) {
      let fn = this._super.bind(this);
      filter = filter || {};
      return currentStateService.getCustomer().then(customer => {
        this.currentCustomer = customer;
        return fn(filter);
      });
    },
    getTableOptions: function() {
      return {
        noDataText: 'You have no invoices yet',
        noMatchesText: 'No invoices found matching filter.',
        searchFieldName: 'number',
        columns: [
          {
            title: 'Invoice number',
            className: 'all',
            render: function(row) {
              var href = $state.href('organization.invoiceDetails',
                {invoiceUUID: row.uuid});
              return '<a href="{href}">{name}</a>'
                .replace('{href}', href)
                .replace('{name}', row.number);
            }
          },
          {
            title: 'State',
            className: 'all',
            render: function(row) {
              return row.state;
            }
          },
          {
            title: 'Price',
            className: 'all',
            render: function(row) {
              return $filter('defaultCurrency')(row.price);
            }
          },
          {
            title: 'Tax',
            className: 'min-tablet-l',
            render: function(row) {
              return $filter('defaultCurrency')(row.tax);
            }
          },
          {
            title: 'Total',
            className: 'min-tablet-l',
            render: function(row) {
              return $filter('defaultCurrency')(row.total);
            }
          },
          {
            title: 'Invoice date',
            className: 'all',
            render: function(row) {
              return row.invoice_date || '&mdash;';
            }
          },
          {
            title: 'Due date',
            className: 'min-tablet-l',
            render: function(row) {
              return row.due_date || '&mdash;';
            }
          }
        ],
        rowActions: this.getRowActions()
      };
    },
    getRowActions: function() {
      if (currentUser.is_staff) {
        return [
          {
            name: '<i class="fa fa-envelope-o"></i> Send notification',
            callback: this.sendNotification.bind(controllerScope),

            isDisabled: function(row) {
              return row.state != 'created';
            }.bind(controllerScope),

            tooltip: function(row) {
              if (row.state != 'created') {
                return 'Notification only for the created invoice can be sent.';
              }
            }.bind(controllerScope),
          }
        ];
      }
    },
    sendNotification: function(row) {
      invoicesService.sendNotification(row.uuid).then(function() {
        ncUtilsFlash.success('Invoice notification has been sent to organization owners.');
      }).catch(function() {
        ncUtilsFlash.error('Unable to invoice notification.');
      });
    },
    getSearchFilters: function() {
      this.searchFilters = [
        {
          name: 'state',
          title: 'Pending',
          value: 'pending'
        },
        {
          name: 'state',
          title: 'Canceled',
          value: 'canceled'
        },
        {
          name: 'state',
          title: 'Created',
          value: 'created'
        },
        {
          name: 'state',
          title: 'Paid',
          value: 'paid'
        }
      ];
    },
    getFilter: function() {
      return {
        customer: this.currentCustomer.url
      };
    }
  });

  controllerScope.__proto__ = new InvoicesController();
}
