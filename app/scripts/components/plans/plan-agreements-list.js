const agreementsList = {
  templateUrl: 'views/partials/filtered-list.html',
  controller: CustomerAgreementsTabController,
  controllerAs: 'ListController',
};

export default agreementsList;

function CustomerAgreementsTabController(
  baseControllerListClass,
  agreementsService,
  ENTITYLISTFIELDTYPES) {
  var controllerScope = this;
  var AgreementsController = baseControllerListClass.extend({
    init: function() {
      this.service = agreementsService;
      this._super();

      this.entityOptions = {
        entityData: {
          noDataText: gettext('No plans yet'),
        },
        list: [
          {
            type: ENTITYLISTFIELDTYPES.colorState,
            propertyName: 'state',
            className: 'visual-status',
            getClass: function(state) {
              if (state == 'active') {
                return 'status-circle online';
              } else {
                return 'status-circle offline';
              }
            }
          },
          {
            name: 'Plan name',
            propertyName: 'plan_name',
          },
          {
            name: 'Date',
            propertyName: 'created',
            type: ENTITYLISTFIELDTYPES.dateShort,
          },
          {
            name: 'Monthly price',
            propertyName: 'plan_price',
            type: ENTITYLISTFIELDTYPES.currency
          }
        ]
      };
    }
  });

  controllerScope.__proto__ = new AgreementsController();
}
