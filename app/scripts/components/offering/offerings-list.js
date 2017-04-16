const projectOfferingsList = {
  templateUrl: 'views/partials/filtered-list.html',
  controllerAs: 'ListController',
  controller: ProjectOfferingsListController,
};

// @ngInject
function ProjectOfferingsListController(
  baseControllerListClass,
  $state,
  $filter,
  offeringsService,
  currentStateService) {
  var controllerScope = this;
  var Controller = baseControllerListClass.extend({
    init: function() {
      this.service = offeringsService;
      let fn = this._super.bind(this);
      currentStateService.getProject().then(project => {
        this.project = project;
        this.tableOptions = {
          searchFieldName: 'name',
          noDataText: gettext('You have no requested services.'),
          noMatchesText: gettext('No requested services found matching filter.'),
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
            var href = $state.href('offeringDetails', {uuid: row.uuid});
            return '<a href="{href}">{name}</a>'
                   .replace('{href}', href)
                   .replace('{name}', row.name);
          }
        },
        {
          title: gettext('Type'),
          render: row => row.type_label
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
      return `<action-button-resource button-controller="controller" button-model="controller.list[${index}]"/>`;
    },
    findIndexById: function(row) {
      // TODO: extract duplicating code to utils
      var index;
      for (var i = 0; i < controllerScope.list.length; i++) {
        if (controllerScope.list[i].uuid === row.uuid) {
          index = i;
        }
      }
      return index;
    },
    reInitResource:function(offering) {
      return this.service.$get(offering.uuid).then(response => {
        var index = this.list.indexOf(offering);
        this.list[index] = response;
      });
    },
    getFilter: function() {
      return {
        project_uuid: this.project.uuid,
      };
    }
  });
  controllerScope.__proto__ = new Controller();
}

export default projectOfferingsList;
