const projectOfferingsList = {
  templateUrl: 'views/partials/filtered-list.html',
  controllerAs: 'ListController',
  controller: ProjectOfferingsListController,
  bindings: {
    filter: '<'
  },
};

// @ngInject
function ProjectOfferingsListController(
  baseControllerListClass,
  $state,
  $filter,
  ncUtils,
  $sanitize,
  offeringsService,
  currentStateService) {
  let controllerScope = this;
  let Controller = baseControllerListClass.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.service = offeringsService;
      let fn = this._super.bind(this);
      currentStateService.getProject().then(project => {
        this.project = project;
        this.tableOptions = {
          searchFieldName: 'name',
          noDataText: gettext('You have no requests.'),
          noMatchesText: gettext('No requests found matching filter.'),
          columns: this.getColumns(),
          rowActions: this.getRowActions.bind(this),
        };
        fn();
      });
    },
    getColumns: function() {
      return [
        {
          title: gettext('Name'),
          render: function(row) {
            const href = $state.href('offeringDetails', {uuid: row.uuid});
            return ncUtils.renderLink(href, $sanitize(row.name));
          }
        },
        {
          title: gettext('Type'),
          render: row => row.type_label || 'N/A'
        },
        {
          title: gettext('State'),
          render: row => {
            const index = this.findIndexById(row);
            return `<offering-state offering="controller.list[${index}]">`;
          }
        },
        {
          title: gettext('Creation date'),
          render: function(row) {
            return $filter('dateTime')(row.created);
          }
        }
      ];
    },
    getRowActions: function(row) {
      const index = this.findIndexById(row);
      return `<action-button-resource button-controller="controller" button-model="controller.list[${index}]"></action-button-resource>`;
    },
    reInitResource:function(offering) {
      return this.service.$get(offering.uuid).then(response => {
        let index = this.list.indexOf(offering);
        this.list[index] = response;
      });
    },
    getFilter: function() {
      return {
        project_uuid: this.project.uuid,
        ...this.filter,
      };
    }
  });
  controllerScope.__proto__ = new Controller();
}

export default projectOfferingsList;
