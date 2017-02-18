const paymentsList = {
  templateUrl: 'views/partials/filtered-list.html',
  controller: PaymentsListController,
  controllerAs: 'ListController',
};

export default paymentsList;

// @ngInject
function PaymentsListController(
  baseControllerListClass,
  paymentsService,
  ENTITYLISTFIELDTYPES,
  ENV) {
  var controllerScope = this;
  var PaymentsController = baseControllerListClass.extend({
    defaultErrorMessage: ENV.defaultErrorMessage,
    init: function() {
      this.service = paymentsService;
      this._super();

      this.entityOptions = {
        entityData: {
          noDataText: 'No payments yet',
          hideTableHead: false,
          expandable: true
        },
        list: [
          {
            type: ENTITYLISTFIELDTYPES.colorState,
            propertyName: 'state',
            className: 'visual-status',
            getClass: function(state) {
              var classes = {
                Erred: 'erred',
                Approved: 'online',
                Created: 'processing',
                Cancelled: 'offline'
              };
              var cls = classes[state];
              if (cls == 'processing') {
                return 'icon fa-refresh fa-spin';
              } else {
                return 'status-circle ' + cls;
              }
            }
          },
          {
            name: 'Type',
            propertyName: 'type'
          },
          {
            name: 'Date',
            propertyName: 'created',
            type: ENTITYLISTFIELDTYPES.dateShort,
          },
          {
            name: 'Amount',
            propertyName: 'amount',
            type: ENTITYLISTFIELDTYPES.currency
          }
        ]
      };
      this.expandableOptions = [
        {
          isList: false,
          addItemBlock: false,
          viewType: 'payment'
        }
      ];
    },
    afterGetList: function() {
      this._super();
      angular.forEach(this.list, function(payment) {
        payment.type = 'PayPal';
      });
    }
  });

  controllerScope.__proto__ = new PaymentsController();
}
